import Observer from '../utils/observer.js';

const OFFER = new Map([]);




export default class PointsModel extends Observer {
  constructor() {
    super();
    this._points = [];
  }

  setPoints(updateType, points) {
    this._points = points.slice();

    this._points = adaptData(this._points);

    this._notify(updateType);
  }

  adaptData(points) {

    points.forEach(point => {
      const type = point.typePoint;
      const offers = point.offers;
      offers.forEach(offer => {
        OFFER.set(type, offer);
      });
    });
    return points;
  }

  getPoints() {
    return this._points;
  }

  updatePoint(updateType, update) {
    const index = this._points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    this._points = [
      ...this._points.slice(0, index),
      update,
      ...this._points.slice(index + 1),
    ];

    this._notify(updateType, update);
  }

  addPoint(updateType, update) {
    this._points = [
      update,
      ...this._points,
    ];

    this._notify(updateType, update);
  }

  deletePoint(updateType, update) {
    const index = this._points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    this._points = [
      ...this._points.slice(0, index),
      ...this._points.slice(index + 1),
    ];

    this._notify(updateType);
  }

  static adaptToClient(point) {
    const adaptedPoint = Object.assign(
      {},
      point,
      {
        // dueDate: point.due_date !== null ? new Date(point.due_date) : point.due_date, // На клиенте дата хранится как экземпляр Date
        // isArchive: point.is_archived,
        // isFavorite: point.is_favorite,
        // repeating: point.repeating_days,


        typePoint: point.type,
        dateFrom: point.date_from,
        basePrice: point.base_price,
        dateTo: point.date_to,

        isFavorite: point.is_favorite,
        // typePoint: point.type,
        // typePoint: point.type,

      },
    );

    // Ненужные ключи мы удаляем
    delete adaptedPoint.type;
    delete adaptedPoint.date_from;
    delete adaptedPoint.base_price;
    delete adaptedPoint.date_to;
    delete adaptedPoint.is_favorite;

    return adaptedPoint;
  }

  static adaptToServer(point) {
    const adaptedPoint = Object.assign(
      {},
      point,
      {
        'due_date': point.dueDate instanceof Date ? point.dueDate.toISOString() : null, // На сервере дата хранится в ISO формате
        'is_archived': point.isArchive,
        'is_favorite': point.isFavorite,
        'repeating_days': point.repeating,
      },
    );

    // Ненужные ключи мы удаляем
    delete adaptedPoint.dueDate;
    delete adaptedPoint.isArchive;
    delete adaptedPoint.isFavorite;
    delete adaptedPoint.repeating;

    return adaptedPoint;
  }
}
