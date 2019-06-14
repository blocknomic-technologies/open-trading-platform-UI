import store from '@/store.js';
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import {
  dateToDisplayTime,
} from '@/utils/utility';

import keyMaps from '@/assets/json/keyMaps.js';
// import reverseKeyMaps from '@/assets/json/reverseKeyMaps.js';

let engineWS;
const UNSUBSCRIBE_PAIR = 'nhsfdf';

const IDS = {
  MARKET_DEPTH_ID: 5,
  MARKET_STATUS_ID: 7,
  LATEST_TRANSACTION_ID: 9,
  KLINE_SUBSCRIBE_ID: 11,
  KLINE_QUERY_ID: 21,
};

const DEFAULT_PRECISION = '10';

const TIMESTAMP = {
  '1': 60,
  '5': 300,
  '15': 900,
  '30': 1800,
  '60': 3600,
  '1D': 86400,
  '1W': 604800,
  '1M': 18144000,
};

let connectionFlag = false;
connectToCoinex();

function connectToCoinex() {
  engineWS = new WebSocket('wss://socket.coinex.com');

  engineWS.onopen = handleOpen;
  engineWS.onmessage = handleMessage;
  engineWS.onclose = connectToCoinex;
}
// engineWS.onerror = console.error;
function subscribeMarketStatus(pair, id) {
  let subscribeObject = JSON.stringify({
    'method': 'state.subscribe',
    'params': [
      pair, //null for Subscribe all
    ],
    'id': id,
  });
  engineWS.send(subscribeObject);
}

function subscribeMarketDepth(pair, limit, interval, id) {
  let subscribeObject = JSON.stringify({
    'method': 'depth.subscribe',
    'params': [
      pair, //#1.market: See<API invocation description·market> 
      limit, //#2.limit: Count limit, Integer
      interval, //#3.interval: Merge，String
    ],
    'id': id,
  });
  engineWS.send(subscribeObject);
}

function subscribeLatestTrade(pair, id) {
  let subscribeObject = JSON.stringify({
    'method': 'deals.subscribe',
    'params': [
      pair, //#1.market: See<API invocation description·market>                     //#2.second for each cycle now supports: 1min,3min,5min,15min,30min,1hour,2hour,4hour,6hour,12hour,1day,3day,1week.
    ],
    'id': id,
  });
  engineWS.send(subscribeObject);
}

function subscribeKlineData(pair, seconds, id) {

  let subscribeObject = JSON.stringify({
    'method': 'kline.subscribe',
    'params': [
      pair, //#1.market: See<API invocation description·market> 
      seconds,
    ],
    'id': id,
  });

  engineWS.send(subscribeObject);
}

function queryKlineData(pair, rangeStartDate, rangeEndDate, seconds, id) {

  let subscribeObject = JSON.stringify({
    'method': 'kline.query',
    'params': [
      pair, //#1.market: See<API invocation description·market> 
      rangeStartDate,
      rangeEndDate,
      seconds,
    ],
    'id': id,
  });
  engineWS.send(subscribeObject);
}

function handleOpen() {

  let selectedPair = keyMaps['coinex-_-' + store.getters.selectedPair];
  if (store.getters.selectedExchange === 'coinex') {
    connectionFlag = true;

    subscribeMarketDepth(selectedPair, 20, DEFAULT_PRECISION, IDS.MARKET_DEPTH_ID);
    subscribeLatestTrade(selectedPair, 60, IDS.LATEST_TRANSACTION_ID);
    // queryKlineData(selectedPair, 60, IDS.KLINE_ID);  
    // subscribeKlineData(selectedPair, 60, IDS.KLINE_ID);
  } else {
    connectionFlag = false;
  }
  subscribeMarketStatus(selectedPair, IDS.MARKET_STATUS_ID);
}


function handleExchange(ex) {
  let selectedPair = keyMaps['coinex-_-' + store.getters.selectedPair];
  if (ex === 'coinex') {
    connectionFlag = true;
    subscribeMarketDepth(selectedPair, 100, '10', IDS.MARKET_DEPTH_ID);
    subscribeLatestTrade(selectedPair, 60, IDS.LATEST_TRANSACTION_ID);
  } else {
    connectionFlag = false;

  }

  subscribeMarketStatus(selectedPair, IDS.MARKET_STATUS_ID);
}


function changePrecision(precision) {
  let str;
  str = precision.toString();
  if (precision == 0.1) {
    str = '0';
  }

  let selectedPair = keyMaps['coinex-_-' + store.getters.selectedPair];
  if (store.getters.selectedExchange === 'coinex') {
    subscribeMarketDepth(UNSUBSCRIBE_PAIR, 100, str, IDS.MARKET_DEPTH_ID);
    subscribeMarketDepth(selectedPair, 100, str, IDS.MARKET_DEPTH_ID);
  }
}
// function SubscribePair(pair) {
// //   subscribeMarketStatus(pair,15);
// //   subscribeMarketDepth(pair,20,"0",16);
//   subscribeLatestTrade(pair,16);
// //   subscribeKlineData(pair, 60, 7);
// }

function UnsubscribeAll() {
  // subscribeMarketStatus(UNSUBSCRIBE_PAIR, IDS.MARKET_STATUS_ID);
  subscribeMarketDepth(UNSUBSCRIBE_PAIR, 20, '0', IDS.MARKET_DEPTH_ID);
  subscribeLatestTrade(UNSUBSCRIBE_PAIR, 10, 0, IDS.LATEST_TRANSACTION_ID);
  // subscribeKlineData(UNSUBSCRIBE_PAIR, 60, IDS.KLINE_ID);
}

function handleMessage({
  data,
}) {
  let selectedPair = keyMaps['coinex-_-' + store.getters.selectedPair];
  let tickerPacket;
  let responsePacket;
  let percentage;
  let arr;

  // let responseArray;
  let message = JSON.parse(data);


  switch (message.id) {
    case IDS.KLINE_QUERY_ID:
      sendSnapshotTradingView(message.result);
  }
  switch (message.method) {
    case 'state.update':

        
      tickerPacket = message.params[0][selectedPair];
      if (tickerPacket) {
        percentage = ((Number(tickerPacket.last) - Number(tickerPacket.open)) / Number(tickerPacket.open)) * 100;
        responsePacket = {
          exchange: 'coinex',
          high: tickerPacket.high,
          last: tickerPacket.last,
          low: tickerPacket.low,
          percentage: percentage.toFixed(4),
          symbol: store.getters.selectedPair,
          volume: Number(tickerPacket.volume).toFixed(2),
        };
        ExchangeDataEventBus.$emit('ticker', responsePacket);
      } else {
        break;
      }
      break;
    case 'depth.update':
      tickerPacket = message.params;
      handleDepthUpdate(tickerPacket);
      break;
    case 'kline.update':
      sendUpdateTradingView(message.params[0]);
      break;
    case 'deals.update':
      // console.log(message);

      if (message.params[1].length === 100) {
        arr = message.params[1].map((element) => {
          let obj = {};
          obj.price = Number(element.price).toFixed(2);
          obj.timeStamp = dateToDisplayTime(new Date(element.time));
          obj.volume = Math.abs(element.amount);
          obj.buyOrSell = element.type;
          return obj;
        });
        ExchangeDataEventBus.$emit('snapshotTrades', arr);
      } else {
        message.params[1].forEach(element => {
          responsePacket = {
            buyOrSell: element.type,
            price: Number(element.price).toFixed(2),
            timeStamp: dateToDisplayTime(new Date(element.time)),
            volume: Math.abs(element.amount).toFixed(4),
          };
          ExchangeDataEventBus.$emit('liveTrades', responsePacket);
        });
      }

      // responsePacket = {
      //   buyOrSell : ,
      //   price: ,
      //   timeStamp:,
      //   volume:,
      // }
      break;
  }
}
let asksObj = {};
let bidsObj = {};

function handleDepthUpdate(depthPacket) {
  let asks = depthPacket[1].asks;
  let bids = depthPacket[1].bids;
  if (depthPacket[0]) {
    asksObj = {};
    bidsObj = {};
  }
  asksObj = depthReducer(asks, asksObj);
  bidsObj = depthReducer(bids, bidsObj);
  let asksArray = sortData(Object.values(asksObj));
  let bidsArray = sortData(Object.values(bidsObj));
  if (depthPacket[0]) {
    ExchangeDataEventBus.$emit('snapshotOrderbook', {
      asks: asksArray,
      bids: bidsArray,
    });
  } else {
    ExchangeDataEventBus.$emit('updateOrderbook', {asks:asksArray,bids:bidsArray,});

  }

}

function sortData(arr) {
  return arr.sort(function (a, b) {
    return a.value - b.value;
  });
}

function depthReducer(array, initial = {}) {
  return array.reduce(function (obj, arr) {

    if (Number(Number(arr[1]).toFixed(3)) === 0) {
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

function coinexConnect() {
  UnsubscribeAll();
  handleOpen();
}


function coinexExchnangeConnect(ex) {
  UnsubscribeAll();
  handleExchange(ex);
}

function askKlineData(inoutPacket) {
  if (connectionFlag) {
    let period = TIMESTAMP[inoutPacket.period];
    let selectedPair = keyMaps['coinex-_-' + store.getters.selectedPair];
    queryKlineData(selectedPair, inoutPacket.rangeStartDate, inoutPacket.rangeEndDate, period, IDS.KLINE_QUERY_ID);
    subscribeKlineData(selectedPair, period, IDS.KLINE_SUBSCRIBE_ID);
  }
}



function resolveSymbolFn(symbol) {
  if (!connectionFlag) {
    return;
  }
  // console.log('resolve symbol:', symbol);
  switch (symbol) {
    case 'BTC':
      ExchangeDataEventBus.$emit('candle-symbol-resolved', btcdata);
      break;
    case 'ETH':
      ExchangeDataEventBus.$emit('candle-symbol-resolved', ethdata);
      break;
    case 'NEO':
      ExchangeDataEventBus.$emit('candle-symbol-resolved', neodata);
      break;
    default:
      ExchangeDataEventBus.$emit('candle-symbol-resolved', symboldata(symbol));
  }
  return;
}

let ethdata = {
  name: 'ETH/USD',
  'exchange-traded': 'coinex',
  'exchange-listed': 'coinex',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  minmov: 1,
  minmov2: 0,
  pointvalue: 1,
  session: '24x7',
  has_seconds: true,
  has_intraday: true,
  has_weekly_and_monthly: true,
  has_no_volume: false,
  description: 'Etherium on coinex',
  type: 'bitcoin',
  supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', ],
  pricescale: 100,
  ticker: 'ETH',
  base_name: ['ETH', ],
  legs: ['BTC', ],
  exchange: 'coinex',
  full_name: 'coinex',
  pro_name: 'ETH',
  data_status: 'streaming',
};

let btcdata = {
  name: 'BTC/USD',
  'exchange-traded': 'coinex',
  'exchange-listed': 'coinex',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  minmov: 1,
  minmov2: 0,
  pointvalue: 1,
  session: '24x7',
  has_seconds: true,
  has_intraday: true,
  has_weekly_and_monthly: true,
  has_no_volume: false,
  description: 'coinex bitcoin prices',
  type: 'bitcoin',
  supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', ],
  pricescale: 100,
  ticker: 'BTC',
  base_name: ['BTC', ],
  legs: ['BTC', ],
  exchange: 'coinex',
  full_name: 'coinex',
  pro_name: 'BTC',
  data_status: 'streaming',
};

let neodata = {
  name: 'NEO/USD',
  'exchange-traded': 'coinex',
  'exchange-listed': 'coinex',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  minmov: 1,
  minmov2: 0,
  pointvalue: 1,
  session: '24x7',
  has_seconds: true,
  has_intraday: true,
  has_weekly_and_monthly: true,
  has_no_volume: false,
  description: 'NEO on coinex',
  type: 'bitcoin',
  supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', ],
  pricescale: 100,
  ticker: 'NEO',
  base_name: ['NEO', ],
  legs: ['NEO', ],
  exchange: 'coinex',
  full_name: 'coinex',
  pro_name: 'NEO',
  data_status: 'streaming',
};


function symboldata(symbol) {
  let pair = symbol.split('/')[0];
  let datareturn = {
    name: symbol,
    'exchange-traded': 'coinex',
    'exchange-listed': 'coinex',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    minmov: 1,
    minmov2: 0,
    pointvalue: 1,
    session: '24x7',
    has_seconds: true,
    has_intraday: true,
    has_weekly_and_monthly: true,
    has_no_volume: false,
    description: pair + ' on coinex',
    type: 'bitcoin',
    supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', ],
    pricescale: 100,
    ticker: pair,
    base_name: [pair, ],
    legs: [pair, ],
    exchange: 'coinex',
    full_name: 'coinex',
    pro_name: pair,
    data_status: 'streaming',
  };
  return datareturn;
}

function prepareSnapshot(data) {
  return {
    meta: {
      noData: true,
    },
    bars: data.map(convertKlinePacketToTradingView),
  };
}

function convertKlinePacketToTradingView(element) {
  return {
    time: Number(element[0]) * 1000,
    open: Number(element[1]),
    close: Number(element[2]),
    high: Number(element[3]),
    low: Number(element[4]),
    volume: Number(element[5]),
  };
}

function sendUpdateTradingView(klineData) {
  ExchangeDataEventBus.$emit('updateCandles', convertKlinePacketToTradingView(klineData));
}

function sendSnapshotTradingView(klineData) {
  let returnObj = prepareSnapshot(klineData);
  ExchangeDataEventBus.$emit('snapshotCandles', returnObj);
}
ExchangeDataEventBus.$on('change-symbol', coinexConnect);
ExchangeDataEventBus.$on('coinex-unsubscribe', UnsubscribeAll);
ExchangeDataEventBus.$on('subscribe-exchange', coinexExchnangeConnect);
ExchangeDataEventBus.$on('change-precision', changePrecision);
ExchangeDataEventBus.$on('subscribe-candles', askKlineData);
// ExchangeDataEventBus.$on('unsubscribe-candles', askKlineData);
// ExchangeDataEventBus.$emit('updateCandles',);
ExchangeDataEventBus.$on('resolve-candle-symbol', resolveSymbolFn);
