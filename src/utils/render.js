import { AbstractView } from "../view/abstract.js";
// import { isEscEvent } from "./common.js";
const FilterMode = {
    EVERYTHING: 'everything',
    FUTURE: 'future',
    PAST: 'past',
}

const SortMode = {
    DAY: 'day',
    PRICE: 'price',
    TIME: 'time',
    OFFER: 'offer',
    EVENT: 'event',
}

const RenderPosition = {
    AFTERBEGIN: 'afterbegin',
    BEFOREEND: 'beforeend',
};


const createElementDom = (template) => {
    const newElement = document.createElement('div');
    newElement.innerHTML = template;
    return newElement.firstElementChild;
}

const replace = (newChild, oldChild) => {
    // console.log('333', newChild,oldChild, oldChild.parentElement)

    if (newChild instanceof AbstractView) {
        newChild = newChild.getElement();
        // console.log('444', newChild)
    }
    if (oldChild instanceof AbstractView) {
        oldChild = oldChild.getElement();
        // console.log('555', oldChild, oldChild.parentElement)
    }
    const parent = oldChild.parentElement;

    // console.log('333', parent, newChild, oldChild)
    if (parent === null || oldChild === null || newChild === null) {
        throw new Error('Can\`t replace unexisting elements');
    }

    parent.replaceChild(newChild, oldChild);
}

const remove = (component) => {

    if (!(component instanceof AbstractView)) {
        throw new Error('Can remove only components');
    }
    component.getElement().remove();
    component.removeElement();
}

const render = (container, element, place) => {
    //проверка для DOM-элементов и компонентов, у DOM вызываем getElement
    if (container instanceof AbstractView) {
        container = container.getElement();
    }
    if (element instanceof AbstractView) {
        element = element.getElement();
    }
    switch (place) {
        case RenderPosition.AFTERBEGIN:
            container.prepend(element);
            break;
        case RenderPosition.BEFOREEND:
            container.append(element);
            break;
    }
}

export { createElementDom, RenderPosition, remove, render, replace, FilterMode, SortMode }
