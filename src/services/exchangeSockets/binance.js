import store from '@/store.js';
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import {
  dateToDisplayTime,
} from '@/utils/utility';

import keyMaps from '@/assets/json/keyMaps.js';
import binanceService from '@/services/binanceService.js';

// import reverseKeyMaps from '@/assets/json/reverseKeyMaps.js';
let connectionFlag = false;
let selectedPair = 'BTC/USD';
const binanceBaseAddr = 'wss://stream.binance.com:9443/stream?streams=';
let binance = {
  close() {},
};
let binanceKline = {
  close() {},
};
let selectedExchange;
let period;
let asksObj = {};
let bidsObj = {};
let precision = 1;
let flag;
const klineIntervals = {
  '1': '1m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '1D': '1d',
  '1W': '1w',
  '1M': '1M',
};
// <symbol>@trade trade stream
// <symbol>@aggTrade agg trade stream
// {/* <symbol>@kline_<interval> */} kline stream
// <symbol>@ticker ticker
// <symbol>@depth<levels> //order book
// Stream Name: <symbol>@depth order book diff. depth stream
// https://www.binance.com/api/v1/depth?symbol=BNBBTC&limit=1000 depth snampshot

function connectToBinance(address) {
  let addr = binanceBaseAddr + address;
  binance = new WebSocket(addr);
  binance.onopen = handleopen;
  binance.onmessage = handleMessage;
  binance.onclose = handleClose;

}

function connectToKlineBinance(address) {
  let addr = binanceBaseAddr + address;
  binanceKline = new WebSocket(addr);
  binanceKline.onopen = handleopen;
  binanceKline.onmessage = handleMessage;
  binanceKline.onclose = handleClose;
}

function handleopen() {}

function handleClose() {
  // generalConnectToExchange();
}


function handleMessage(data) {
  let message = JSON.parse(data.data);
  let packetdata = message.data;
  let responsePacket;
  switch (message.stream) {
    case `${selectedPair}@ticker`:
      responsePacket = {
        exchange: 'binance',
        high: Number(packetdata.h),
        last: Number(packetdata.c),
        low: Number(packetdata.l),
        percentage: Number(packetdata.P).toFixed(4),
        symbol: store.getters.selectedPair,
        volume: Number(packetdata.v).toFixed(2),
      };




      ExchangeDataEventBus.$emit('ticker', responsePacket);
      break;
    case `${selectedPair}@trade`:
      // ExchangeDataEventBus.$emit('snapshotTrades', handleTradeUpdate(packetdata));
      // console.log(handleTradeUpdate(packetdata));
      ExchangeDataEventBus.$emit('liveTrades', handleTradeUpdate(packetdata));
      break;
    case `${selectedPair}@depth`:
      if (packetdata.a.length) {
        asksObj = depthReducer(packetdata.a, asksObj);
      }
      if (packetdata.b.length) {
        bidsObj = depthReducer(packetdata.b, bidsObj);
      }
      flag = false;
      precisionData();
      break;
    case `${selectedPair}@kline_${period}`:
      handleKlineUpdate(packetdata.k);
      break;
    case 'default':
      break;
  }
}

function handleKlineUpdate(data) {
  let bar = {
    time: Number(data.T),
    open: Number(data.o),
    high: Number(data.h),
    low: Number(data.l),
    close: Number(data.c),
    volume: Number(data.v),
  };
  ExchangeDataEventBus.$emit('updateCandles', bar);

}

function handleTradeUpdate(tradeData) {
  return {
    buyOrSell: tradeData.m ? 'sell' : 'buy',
    price: Number(tradeData.p),
    timeStamp: dateToDisplayTime(new Date(tradeData.T)),
    volume: Number(tradeData.q),
  };
}

function closeConnection() {
  binance.close();
  binanceKline.close();
}

function generalConnectToExchange(ex) {
  selectedPair = keyMaps['binance-_-' + store.getters.selectedPair];
  selectedExchange = ex;
  if (selectedExchange === 'binance') {
    connectionFlag = true;
    makeApiCalls();
  } else {
    connectionFlag = false;
    closeConnection();
    connectToBinance(`${selectedPair}@ticker`);
  }
}

function handleChangeSymbol() {
  closeConnection();

  generalConnectToExchange(store.getters.selectedExchange);
}

function handleChangeExchnage(ex) {
  if (ex !== 'binance') {
    closeConnection();
    connectToBinance(`${keyMaps['binance-_-' + store.getters.selectedPair]}@ticker`);
  } else {
    generalConnectToExchange(ex);

  }
}
async function askKlineData(inputPacket) {
  if (selectedExchange === 'binance') {
    period = klineIntervals[inputPacket.period];
    let response = await binanceService.binanceKlineData({
      pair: selectedPair,
      interval: period,
    });
    connectToKlineBinance(`${selectedPair}@kline_${period}`);
    sendSnapshot(response.data);
    // connectToKlineBinance(`${selectedPair}@kline_${period}`);
  }
}

function sendSnapshot(data) {
  let packet = data.map(klineObject);
  let complete = {
    meta: {
      noData: true,
    },
    bars: packet,
  };
  ExchangeDataEventBus.$emit('snapshotCandles', complete);
}

function klineObject(element) {
  return {
    time: Number(element[0]),
    open: Number(element[1]),
    high: Number(element[2]),
    low: Number(element[3]),
    close: Number(element[4]),
    volume: Number(element[5]),
  };
}



async function makeApiCalls() {
  precision = 10;
  asksObj = {};
  bidsObj = {};
  let response = await binanceService.binanceData({
    pair: selectedPair.toLowerCase(),
  });
  let resData = response.data;
  connectToBinance(`${selectedPair}@ticker/${selectedPair}@trade/${selectedPair}@depth`);

  let tradesSnapshot = resData.trades.map((element) => {
    return {
      buyOrSell: element.isBuyerMaker ? 'sell' : 'buy',
      price: Number(element.price),
      timeStamp: dateToDisplayTime(new Date(element.time)),
      volume: Number(element.qty),
    };
  });
  ExchangeDataEventBus.$emit('snapshotTrades', tradesSnapshot);
  let resDepth = resData.depth;
  asksObj = depthReducer(resDepth.asks, asksObj);
  bidsObj = depthReducer(resDepth.bids, bidsObj);
  flag = true;
  precisionData();
}


function depthReducer(array, initial = {}) {
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
  'exchange-traded': 'binance',
  'exchange-listed': 'binance',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  minmov: 1,
  minmov2: 0,
  pointvalue: 1,
  session: '24x7',
  has_seconds: true,
  has_intraday: true,
  has_weekly_and_monthly: true,
  has_no_volume: false,
  description: 'Etherium on binance',
  type: 'bitcoin',
  supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', ],
  pricescale: 100,
  ticker: 'ETH',
  base_name: ['ETH', ],
  legs: ['BTC', ],
  exchange: 'binance',
  full_name: 'binance',
  pro_name: 'ETH',
  data_status: 'streaming',
};

let btcdata = {
  name: 'BTC/USD',
  'exchange-traded': 'binance',
  'exchange-listed': 'binance',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  minmov: 1,
  minmov2: 0,
  pointvalue: 1,
  session: '24x7',
  has_seconds: true,
  has_intraday: true,
  has_weekly_and_monthly: true,
  has_no_volume: false,
  description: 'binance bitcoin prices',
  type: 'bitcoin',
  supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', ],
  pricescale: 100,
  ticker: 'BTC',
  base_name: ['BTC', ],
  legs: ['BTC', ],
  exchange: 'binance',
  full_name: 'binance',
  pro_name: 'BTC',
  data_status: 'streaming',
};

let neodata = {
  name: 'NEO/USD',
  'exchange-traded': 'binance',
  'exchange-listed': 'binance',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  minmov: 1,
  minmov2: 0,
  pointvalue: 1,
  session: '24x7',
  has_seconds: true,
  has_intraday: true,
  has_weekly_and_monthly: true,
  has_no_volume: false,
  description: 'NEO on binance',
  type: 'bitcoin',
  supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M', ],
  pricescale: 100,
  ticker: 'NEO',
  base_name: ['NEO', ],
  legs: ['NEO', ],
  exchange: 'binance',
  full_name: 'binance',
  pro_name: 'NEO',
  data_status: 'streaming',
};

function symboldata(symbol) {
  let pair = symbol.split('/')[0];
  let datareturn = {
    name: symbol,
    'exchange-traded': 'binance',
    'exchange-listed': 'binance',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    minmov: 1,
    minmov2: 0,
    pointvalue: 1,
    session: '24x7',
    has_seconds: true,
    has_intraday: true,
    has_weekly_and_monthly: true,
    has_no_volume: false,
    description: pair + ' on binance',
    type: 'bitcoin',
    supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', ],
    pricescale: 100,
    ticker: pair,
    base_name: [pair, ],
    legs: [pair, ],
    exchange: 'binance',
    full_name: 'binance',
    pro_name: pair,
    data_status: 'streaming',
  };
  return datareturn;
}

function precisionData() {
  emitPrecisionData(precision);
}

function emitPrecisionData(precisionPass) {
  precision = precisionPass;
  let precisionAsksObj = Object.keys(asksObj).reduce(precisionObjectCreater, {});
  let precisionBidsObj = Object.keys(bidsObj).reduce(precisionBidsObjectCreater, {});

  let asksArray = sortData(Object.values(precisionAsksObj));
  let bidsArray = sortData(Object.values(precisionBidsObj));
  if (flag) {
    ExchangeDataEventBus.$emit('snapshotOrderbook', {
      asks: asksArray,
      bids: bidsArray,
    });
  } else {
    ExchangeDataEventBus.$emit('updateOrderbook', {
      asks: asksArray,
      bids: bidsArray,
    });
  }
}

function sortData(arr) {
  return arr.sort(function (a, b) {
    return a.value - b.value;
  });
}
// function sortData2(arr) {
//   return arr.sort(function (a, b) {
//     return b.value - a.value;
//   });
// }

function precisionObjectCreater(previous, current) {
  let roundedCurrent = roundANumber(current);
  let roundedValue;

  if (precision === 0.1) {
    roundedValue = roundedCurrent.toFixed(2);
  } else {
    roundedValue = roundedCurrent;
  }
  if (!previous[roundedCurrent]) {
    previous[roundedCurrent] = {
      value: roundedValue,
      volume: 0,
    };
  }
  previous[roundedCurrent].volume += asksObj[current].volume;
  return previous;
}

function precisionBidsObjectCreater(previous, current) {
  let roundedCurrent = roundANumber(current);
  let roundedValue;

  if (precision === 0.1) {
    roundedValue = roundedCurrent.toFixed(2);
  } else {
    roundedValue = roundedCurrent;
  }
  if (!previous[roundedCurrent]) {
    previous[roundedCurrent] = {
      value: roundedValue,
      volume: 0,
    };
  }
  previous[roundedCurrent].volume += bidsObj[current].volume;
  return previous;
}

function roundANumber(number) {
  return Math.round(number / precision) * precision;
}

ExchangeDataEventBus.$on('change-symbol', handleChangeSymbol);
ExchangeDataEventBus.$on('binance-unsubscribe', closeConnection);
ExchangeDataEventBus.$on('subscribe-exchange', handleChangeExchnage);
// ExchangeDataEventBus.$on('change-precision', changePrecision);
ExchangeDataEventBus.$on('subscribe-candles', askKlineData);
ExchangeDataEventBus.$on('resolve-candle-symbol', resolveSymbolFn);
ExchangeDataEventBus.$on('change-precision', emitPrecisionData);
selectedPair = keyMaps['binance-_-' + store.getters.selectedPair];
connectToBinance(`${selectedPair}@ticker`);
