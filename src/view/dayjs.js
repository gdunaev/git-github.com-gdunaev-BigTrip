import dayjs from 'dayjs';
import { getRandomInteger } from "./util";

const minMax = require('dayjs/plugin/minMax');
dayjs.extend(minMax);

const getStringDate = (partDate, symbol, isDay) => {
  if (partDate === 0) {
    return (isDay === true ? `00${symbol} ` : '');
  } else if (partDate < 10) {
    return `0${partDate}${symbol} `;
  } else if (partDate >= 10) {
    return `${partDate}${symbol} `;
  }
}

const getMinMaxDurationDate = () => {

    const dates = [getRandomDate(), getRandomDate()];

    const minMaxDates = [];
    minMaxDates.push(dayjs.min(dates));
    minMaxDates.push(dayjs.max(dates));

    //получим разницу в миллисекундах, и разделим на дни/часы/минуты
    const durationMinuteAll = Math.trunc(minMaxDates[1].diff(minMaxDates[0]) / 60000);
    const durationMin = durationMinuteAll % 60;
    const durationHourAll = (durationMinuteAll - durationMin)/60;
    const durationHour = durationHourAll % 24;
    const durationDay = (durationHourAll - durationHour)/24;

    const isDay = durationDay === 0 ? false : true;

    let durationPoint = getStringDate(durationMin, 'M', false);
    durationPoint = getStringDate(durationHour, 'H', isDay) + durationPoint;
    durationPoint = getStringDate(durationDay, 'D', isDay) + durationPoint;

    //а потом эту дату запишем в массив с форматированием
    minMaxDates.push(durationPoint);

    return minMaxDates;
}

const getRandomDate = () => {
    return dayjs(dayjs().add(getRandomInteger(60, 3000), 'minute').toDate());
}

const getDateHour = (date) => {
    return date.format('HH:mm');
}

const getMonthDay = (date) => {
    return date.format('MMM DD');
}

const getOnlyDate = (date) => {
  return date.format('YYYY-MM-DD');
}

const getDateHourMinute = (date) => {
  return date.format('YYYY-MM-DDTHH:mm');
}


export { getDateHour, getMonthDay, getRandomDate, getMinMaxDurationDate, getOnlyDate, getDateHourMinute}
