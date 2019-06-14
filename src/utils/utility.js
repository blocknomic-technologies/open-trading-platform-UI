import store from '@/store';

export function stringArrayToHtmlList(array) {
  return `<ul><li>${array.join('</li><li>')}</li><ul>`;
}

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getCurrencyBalance(currency = '') {
  return (store
    .getters
    .ledger
    .find(item => item.currency.toUpperCase() === currency.toUpperCase()) || {})
    .amount || 0;
}

export function dateToDisplayTime(date = new Date()) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  return `${(hours < 10 ? '0' : '')}${hours}:${(minutes < 10 ? '0' : '')}${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
}

export function dateToDisplayDate(date = new Date()) {
  let currentDate = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();
  return `${currentDate} ${getMonthFromIndex(month)} ${year}`;
}

export function getMonthFromIndex(index) {
  switch (index + 1) {
    case 1:
      return 'Jan';
    case 2:
      return 'Feb';
    case 3:
      return 'March';
    case 4:
      return 'April';
    case 5:
      return 'May';
    case 6:
      return 'June';
    case 7:
      return 'July';
    case 8:
      return 'August';
    case 9:
      return 'September';
    case 10:
      return 'October';
    case 11:
      return 'November';
    case 12:
      return 'December';
  }
}

export function dateToDisplayDateTime(date = new Date()) {
  return `${dateToDisplayDate(date)} ${dateToDisplayTime(date)}`;
}

export function depthReducer(array, initial = {}) {
  return array.reduce(function (obj, arr) {
    if (Number(arr[1]) === 0) {
      delete obj[arr[0]];
    } else {
      obj[arr[0]] = {
        value: Number(arr[0]),
        volume: Number(arr[1]),
      };
    }
    return obj;
  }, initial);
}

export function sortData(arr) {
  return arr.sort(function (a, b) {
    return a.value - b.value;
  });
}

export function roundANumber(number, precision) {
  // const PS = precision;
  // const DP = (PS.toString().split('.')[1] || [1, 2,]).length;
  return (Math.round(number / precision) * precision);
}

function calculateTpv() {
  store.commit('totalPortfolioValue');
}

setInterval(calculateTpv, 30 * 1000);
