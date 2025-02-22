import ListEmptyView from "../view/list-empty.js";
import { render, remove } from "../utils/render.js";
import { getSortPricePoints, getSortDayPoints, getSortTimePoints } from "../utils/common.js";
import InfoView from "../view/info.js";
import TripPointPresenter from "./trip-point.js";
import FiltersView from "../view/filter-view.js";
import { getFuturePoints, getPastPoints } from "../view/dayjs.js";
import SiteMenuView from "../view/site-menu.js";
import SortView from "../view/sort.js";
import { Mode, UpdateType, UserAction, FilterType, RenderPosition, SortMode } from "../const.js";
import PointNewPresenter from "./trip-point-new.js";
import LoadingView from '../view/loading.js';



export default class TripPresenter {
  constructor(tripEventsMain, pointsModel, filterModel, api) {
    this._isEmpty = true;
    this._listEmptyView = new ListEmptyView(this._isEmpty);
    this._infoPoints = null;
    this._filtersView = new FiltersView(FilterType.EVERYTHING);
    this._tripEventsMain = tripEventsMain;
    this._pointPresenter = {};
    this._changeModePoint = this._changeModePoint.bind(this);

    // this._currentMode = '';
    this._filterType = null;
    this._sortMode = SortMode.DAY;
    // this._siteMenuView = new SiteMenuView(points);
    this._pointsModel = pointsModel;
    this._filterModel = filterModel;
    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);

    this._pointsModel.addObserver(this._handleModelEvent);
     this._filterModel.addObserver(this._handleModelEvent);
    this._sortView = null;
    this._handleSortModeChange = this._handleSortModeChange.bind(this);
    this._pointNewPresenter = new PointNewPresenter(this._handleViewAction);

    this._isLoading = true;
    this._loadingComponent = new LoadingView(this._isLoading);
    this._api = api;
    this._newEventElement = document.querySelector('.trip-main__event-add-btn');

    this._offers = [];
    this._destinations = [];
  }

  start() {
    // if (this._isEmpty) {
    //   render(this._tripEventsMain, this._listEmptyView, RenderPosition.BEFOREEND);
    //   return;
    // }
    // this._renderMainInfo();
    // this._renderNavigation();
    // const points = this._pointsModel.getPoints();
    // console.log('333444', points)

    this._renderPoints();
  }

  //при нажатии на кнопку "Добавить новую (New event)"
  createPoint() {
    // console.log('11222')
    this._sortMode = SortMode.DAY;
    this._filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this._pointNewPresenter.start(this._points, this._offers, this._destinations);
  }

  //получает точки (с сортировкой или фильтрацией) перед отрисовкой
  _getPoints() {
    this._filterType = this._filterModel.getActiveFilter();

    let points = this._pointsModel.getPoints().slice();

    //  console.log('11', points)

    //фильтрация: Прошлые, Будущие, Все
    switch (this._filterType) {
      case FilterType.PAST:
        points = getPastPoints(points);
        break;
      case FilterType.FUTURE:
        points = getFuturePoints(points);
        break;
      case FilterType.EVERYTHING:
        points = points;
        break;
    }

    //здесь Сортировка (день, время, цена)
    // if (this._currentMode === Mode.SORT) {
      switch (this._sortMode) {
        case SortMode.DAY:
          points = getSortDayPoints(points);
          break;
        case SortMode.TIME:
          points = getSortTimePoints(points);
          break;
        case SortMode.PRICE:
          points = getSortPricePoints(points);
          break;
      }
    // }

    return points;
  }

  _handleViewAction(actionType, updateType, update) {
    switch (actionType) {
      case UserAction.UPDATE:
        this._pointsModel.updatePoint(updateType, update);

        // this._api.updatePoint(update).then((response) => {
        //   this._pointsModel.updatePoint(updateType, response);
        // });

        break;
      case UserAction.ADD:
        // console.log('2- ', update)
        this._pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE:
        this._pointsModel.deletePoint(updateType, update);
        break;
    }
  }

  _handleModelEvent(updateType, point) {

    //  console.log('44', updateType, point)
    switch (updateType) {
      case UpdateType.PATCH:
        this._pointPresenter[point.id].start(point);
        break;
      case UpdateType.MINOR:
        this._clearAllPoints();
        this._renderPoints();
        break;
      case UpdateType.MAJOR:
        this._clearAllPoints({ setCurrentMode: true, resetSortType: true });
        this._renderPoints();
        break;
      case UpdateType.INIT:

        this._isLoading = false;
        remove(this._loadingComponent);
        // remove(this._listEmptyView);

        this._renderPoints();

        break;
    }
  }

  _renderLoading() {
    const tripEvent = document.querySelector('.trip-events');
    render(tripEvent, this._loadingComponent, RenderPosition.BEFOREEND);
    this._newEventElement.disabled = true;
  }

  _clearAllPoints({ setCurrentMode = false, resetSortType = false } = {}) {

    this._pointNewPresenter.destroy();
    Object.values(this._pointPresenter).forEach((presenter) => presenter.destroy());
    this._pointPresenter = {};

    remove(this._sortView);
    remove(this._loadingComponent);
    remove(this._infoPoints);


    if (resetSortType) {
      this._sortMode = SortMode.DAY;
    }

    // //если обновление типа MAJOR (это значит что нажата смена фильтров),
    // //то устанавливаем текущий режим сортировки точек.
    // if(setCurrentMode) {
    //   this._currentMode = Mode.FILTER;
    // }
  }

  _handleSortModeChange(sortMode) {
    if (this._sortMode === sortMode) {
      return;
    }
    // this._currentMode = Mode.SORT;
    this._sortMode = sortMode;

    this._clearAllPoints();//
    this._renderPoints();
  }

  _changeModePoint() {
    this._pointNewPresenter.destroy(); //закрывает открытую форму новой точки
    Object.values(this._pointPresenter).forEach((presenter) => presenter.resetView());
  }

  _renderPoint(point) {
    const pointPresenter = new TripPointPresenter(this._tripEventsMain, this._changeModePoint, this._handleViewAction, this._offers, this._destinations);
    pointPresenter.start(point);
    this._pointPresenter[point.id] = pointPresenter;
  }


  //отрисовка Инфо, Загрузки, Сортировки и Списка точек
  _renderPoints() {

    //при загрузке показываем заставку загрузки
    if (this._isLoading) {
      this._renderLoading();
      return;
    }
    const points = this._getPoints();
    this._offers = this._pointsModel.getOffersAll();
    this._destinations = this._pointsModel.getDestinationsAll();

    // console.log('11', this._offers)

    //  console.log('00', points)

    //отрисовка InfoView (список точек и общая стоимость)
    const tripMain = document.querySelector('.trip-main');
    this._infoPoints = new InfoView(points);
    render(tripMain, this._infoPoints, RenderPosition.AFTERBEGIN);
    this._newEventElement.disabled = false;

    // console.log('111', points)
    //если точек нет - прячем InfoView и показываем заставку
    if (points.length === 0) {
      this._renderNoPoints();
      return;
    }

    //отрисовываем сортировку
    this._renderSort();

    //отрисовываем точки
    points.forEach((point) => this._renderPoint(point));
  }

  //показываем заставку при пустом списке
  _renderNoPoints() {
    const tripInfoMain = document.querySelector('.trip-main__trip-info');
    tripInfoMain.style.display = 'none';
    render(this._tripEventsMain, this._listEmptyView, RenderPosition.BEFOREEND);
  }

  _renderFilters() {
    const tripControlsFilters = document.querySelector('.trip-controls__filters');
    render(tripControlsFilters, this._filtersView, RenderPosition.BEFOREEND);
    this._filtersView.setFilterChangeHandler(() => { this._handleFilterChange() });
  }


  _renderSort() {
    if (this._sortView !== null) {
      this._sortView = null;
    }

    this._sortView = new SortView(this._sortMode);
    this._sortView.setSortModeChangeHandler(this._handleSortModeChange);

    render(this._tripEventsMain, this._sortView, RenderPosition.BEFOREEND);
  }
}
