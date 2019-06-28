import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import {
  dateToDisplayTime,
} from '@/utils/utility';
import keyMaps from '@/assets/json/keyMaps.js';
import reverseKeyMaps from '@/assets/json/reverseKeyMaps.js';
import store from '@/store';

let bequantWs = {
  readyState: 3,
};
let precisionProps = {
  P0: {
    'fractionDigits': 1,
    'round': 0,
  },
  P1: {
    'fractionDigits': 1,
    'round': 1,
  },
  P2: {
    'fractionDigits': 1,
    'round': 10,
  },
  P3: {
    'fractionDigits': 1,
    'round': 100,
  },
};

let P0Data = {
  ask: {},
  bid: {},
};
let P1Data = {
  ask: {},
  bid: {},
};
let P2Data = {
  ask: {},
  bid: {},
};
let P3Data = {
  ask: {},
  bid: {},
};
// let id = 123;
let DefaultPair = 'BTC/USD';
let currentPair = DefaultPair;
let bookPrecision = 'P1';
let candlePeriod = 'M1';
let connectionFlag = false;
let candlePair;
let unsubscribeObject = [];
connectbequant();
// ExchangeDataEventBus.$on('exchange-connect', connectbequant);
ExchangeDataEventBus.$on('precision', changePrecision);

function connectbequant() {}
connectbequant2();

function connectbequant2() {

  bequantWs = new WebSocket('wss://api.bequant.io/api/2/ws');
  // let pair = currentPair.replace('/', '');
  bequantWs.onopen = () => {};

  bequantWs.onmessage = (msg) => {
    //  console.log('message from bequant:', msg);
    let msg1 = JSON.parse(msg.data);
    //console.log('Message from bequantWs : ' + msg.data);
    sortData(msg1);
  };

  bequantWs.onerror = () => {
    // console.log('bequant Error : ' + err);
    // connectbequant();
  };
  bequantWs.onclose = () => {
    bequantWs = {
      readyState: 3,
    };
    connectbequant();

    let pair = keyMaps['bequant-_-' + currentPair];
    let timerId;

    const handler = () => {
      if (WebSocket.OPEN == bequantWs.readyState) {
        subscribeTicker(pair);
        clearInterval(timerId);
      }
    };
    timerId = setInterval(handler, 500);
  };
}

ExchangeDataEventBus.$on('change-symbol', function(pair) {
  // console.log('symbol change called:', pair);
  //currentPair =pair;
  changeTickerPair(pair);
  changePair(pair);
});

ExchangeDataEventBus.$on('subscribe-exchange', function subscribeExchange(exchange) {
  let pair = keyMaps['bequant-_-' + currentPair];
  if (exchange == 'bequant') {
    // console.log('current pair:', currentPair);
    subscribePair(pair);
    connectionFlag = true;
  } else {
    if (connectionFlag) {
      connectionFlag = false;
      unsubscribePair(currentPair);
      // console.log('current pair:', currentPair);
    }
  }
});
ExchangeDataEventBus.$on('subscribe-all-ticker', function subscribAllTicker() {
  let pair = keyMaps['bequant-_-' + currentPair];
  let timerId;

  const handler = () => {
    if (WebSocket.OPEN == bequantWs.readyState) {
      subscribeTicker(pair);
      clearInterval(timerId);
    }
  };
  timerId = setInterval(handler, 500);
});
ExchangeDataEventBus.$on('unsubscribe-all-ticker', function unsubscribAllTicker() {
  let pair = keyMaps['bequant-_-' + currentPair];
  unSubscribeTicker(pair);
});

function changeTickerPair(pair) {
  let lspair = keyMaps['bequant-_-' + currentPair];
  unSubscribeTicker(lspair);
  if (!connectionFlag) {
    currentPair = pair;
  }

  let Cpair = keyMaps['bequant-_-' + pair];
  subscribeTicker(Cpair);
}

function changePair(pair) {
  if (!connectionFlag) {
    //currentPair =pair;
    unsubscribeOrphaned();
    return;
  }

  let unPair = currentPair || DefaultPair;
  // console.log(currentPair, unPair);
  let Cpair = keyMaps['bequant-_-' + pair];
  unsubscribePair(unPair);
  subscribePair(Cpair);
  currentPair = pair;
}

function subscribePair(pair) {
  //console.log('subscribing pair:', pair);
  subscribeOrderBook(pair);
  //subscribeTicker(pair);
  subscribeTrades(pair);
  subscribeCandles(pair, candlePeriod);
}

function unsubscribePair(Cpair) {
  // console.log('unsubscribing:', Cpair);
  let pair = keyMaps['bequant-_-' + Cpair];
  unSubscribeOrderBook(pair);
  //unSubscribeTicker(pair);
  unSubscribeTrades(pair);
  unSubscribeCandles(pair, candlePeriod);
}

function subscribeOrderBook(pair) {
  // console.log('subscribing order book:', pair);
  let order_book = {
    'method': 'subscribeOrderbook',
    'params': {
      'symbol': pair,
    },
    'id': 'orderBook-' + pair,
  };

  bequantWs.send(JSON.stringify(order_book));
}

function subscribeTicker(pair) {
  let ticker = {
    'method': 'subscribeTicker',
    'params': {
      'symbol': pair,
    },
    'id': 'subscribeTicker-' + pair,
  };
  bequantWs.send(JSON.stringify(ticker));
}

function subscribeTrades(pair) {
  let trades = {
    'method': 'subscribeTrades',
    'params': {
      'symbol': pair,
    },
    'id': 'subscribeTrades-' + pair,
  };

  bequantWs.send(JSON.stringify(trades));
}

function subscribeCandles(pair, period) {
  candlePair = pair;
  candlePeriod = period;
  let candles = {
    'method': 'subscribeCandles',
    'params': {
      'symbol': pair,
      'period': period,
    },
    'id': 'subscribeCandles-' + pair,
  };
  bequantWs.send(JSON.stringify(candles));
}


function unSubscribeOrderBook(pair) {
  // console.log('unsubscribing orderBook:', pair);
  unsubscribeObject['orderBook-' + pair] = true;
  let order_book = {
    'method': 'unsubscribeOrderbook',
    'params': {
      'symbol': pair,
    },
    'id': 'orderBook-' + pair,
  };

  bequantWs.send(JSON.stringify(order_book));
}

function unSubscribeTicker(pair) {
  unsubscribeObject['ticker-' + pair] = true;
  let ticker = {
    'method': 'unsubscribeTicker',
    'params': {
      'symbol': pair,
    },
    'id': 'ticker-' + pair,
  };
  bequantWs.send(JSON.stringify(ticker));
}

function unSubscribeTrades(pair) {
  unsubscribeObject['trades-' + pair] = true;
  let trades = {
    'method': 'unsubscribeTrades',
    'params': {
      'symbol': pair,
    },
    'id': 'trades-' + pair,
  };

  bequantWs.send(JSON.stringify(trades));
}

function unSubscribeCandles(pair, period) {
  // console.log('unsubscribe candles:',pair);
  unsubscribeObject['candles-' + pair + '-' + period] = true;
  let candles = {
    'method': 'unsubscribeCandles',
    'params': {
      'symbol': pair,
      'period': period,
    },
    'id': 'candles-' + pair,
  };
  bequantWs.send(JSON.stringify(candles));
}

function unsubscribeOrphaned() {
  if (Object.keys(unsubscribeObject).length > 0) {
    Object.keys(unsubscribeObject).forEach(elem => {
      let split = elem.split('-')[1];
      let pair = split[1];
      let service = split[0];
      switch (service) {
        case 'orderBook':
          unSubscribeOrderBook(pair);
          break;
        case 'ticker':
          unSubscribeTicker(pair);
          break;
        case 'trades':
          unSubscribeTrades(pair);
          break;
        case 'candles':
          unSubscribeCandles(pair, split[2]);
          break;
      }
    });
  }
}

let sortData = (incoming) => {
  let barArray;
  let method = incoming.method;
  let params = incoming.params;
  if (params) {
    let incomingPair = reverseKeyMaps['bequant-_-' + params.symbol];
    if (currentPair != incomingPair) {
      unsubscribeOrphaned();
      unsubscribePair(incomingPair);
      return;
    }
  }

  let dataArray = [];
  if (incoming.id) {
    try {
      delete unsubscribeObject[incoming.id];
    } catch (error) {
      // console.log('error with reading incoming id');
    }

    // let newId = incoming.id.split('-')[0];
    // if (newId == 'orderBook') {
    //   delete unsubscribeObject[incoming.id];
    // }
  }
  //console.log(params);
  switch (method) {
    case 'snapshotTrades':
      //
      dataArray = params.data;
      // snapShot = dataArray;
      //console.log(snapShot.length);
      emitLiveTrades(dataArray, true);
      break;
    case 'updateTrades':

      dataArray = params.data;
      //console.log('update trades', dataArray);
      emitLiveTrades(dataArray, false);

      //ExchangeDataEventBus.$emit('updateTrades', dataArray);      

      break;
    case 'ticker':
      makeTickerResponse(params);
      //ExchangeDataEventBus.$emit('ticker', params);
      break;
    case 'snapshotOrderbook':
      // console.log("snapshot order book:",params);
      //ExchangeDataEventBus.$emit('snapshotOrderbook', params);
      resetData();
      updatePrecisionGrouping(params);
      groupSnapshotByPrecision(params, true);
      //processOrderBookData(params, true);
      // makeprecision(params, bookPrecision, true);


      break;
    case 'updateOrderbook':
      //ExchangeDataEventBus.$emit('updateOrderbook', params);
      // snapShotMaintainer(params);
      groupSnapshotByPrecision(params, false);
      // makeprecision(params, bookPrecision, false);
      //processOrderBookData(params, false);
      break;
    case 'snapshotCandles':
      //console.log('snapshot candles',params);
      dataArray = params.data;
      barArray = barData(params.data);
      ExchangeDataEventBus.$emit('snapshotCandles', barArray);
      break;
    case 'updateCandles':
      // console.log(params);
      dataArray = params.data;
      updateBars(dataArray);
      //ExchangeDataEventBus.$emit('updateCandles', dataArray);     
      break;
    case 'default':
      break;

  }
};

function makeTickerResponse(data) {
  let obj = {};
  if (store.getters.selectedExchange === 'bequant') {
    store.state.sellPrice = data.bid;
    store.state.buyPrice = data.ask;
  }
  obj.ask = data.ask;
  obj.bid = data.bid;
  obj.high = data.high;
  obj.low = data.low;
  obj.last = data.last;
  obj.volume = data.volume;
  obj.symbol = data.symbol;
  obj.percentage = (((data.last - data.open) / data.open) * 100);
  obj.exchange = 'bequant';
  ExchangeDataEventBus.$emit('ticker', obj);
}

function emitLiveTrades(data, isSnapShot) {
  //time price amount

  let length = 1;
  let pair = currentPair.split('/')[1];
  if (pair == 'BTC') {
    length = 5;
  }

  if (isSnapShot) {

    let arr = data.slice(-100).map((elem) => {
      let obj = {};
      obj.price = parseFloat(elem.price).toFixed(length);
      obj.timeStamp = dateToDisplayTime(new Date(elem.timestamp));
      obj.volume = parseFloat(elem.quantity);
      obj.buyOrSell = elem.side;
      return obj;
    }).reverse();

    ExchangeDataEventBus.$emit('liveTrades', arr[1]);
    ExchangeDataEventBus.$emit('snapshotTrades', arr);
  } else {
    data.forEach((elem) => {
      let obj = {};
      obj.price = parseFloat(elem.price).toFixed(length);
      obj.timeStamp = dateToDisplayTime(new Date(elem.timestamp));
      obj.volume = parseFloat(elem.quantity);
      obj.buyOrSell = elem.side;
      ExchangeDataEventBus.$emit('liveTrades', obj);
    });
  }
}


function changePrecision(keyObj) {
  let {
    key,
  } = keyObj;
  if (!connectionFlag) {
    return;
  }
  let keys = ['P0', 'P1', 'P2', 'P3', ];
  let index = keys.indexOf(bookPrecision);
  if (key == 'minus') {
    if (index != 0) {
      bookPrecision = keys[index - 1];
      getOrderBookArrayByPrecision(bookPrecision, false);
    }
  } else {
    if (index != 3) {
      bookPrecision = keys[index + 1];
      getOrderBookArrayByPrecision(bookPrecision, false);
    }
  }
}


ExchangeDataEventBus.$on('subscribe-candles', subscribeCandleEvent);
ExchangeDataEventBus.$on('unsubscribe-candles', unsubscribeCandleEvent);
ExchangeDataEventBus.$on('resolve-candle-symbol', resolveSymbolFn);

function subscribeCandleEvent(info) {
  let symbol = info.symbol.name;
  let period = info.period;

  if (!connectionFlag) {
    return;
  }
  let pair = keyMaps['bequant-_-' + symbol];
  //console.log(pair);
  // console.log("subscribe: called",period);

  let xperiod = 'M1';

  switch (period) {
    case '1':
      xperiod = 'M1';
      break;
    case '5':
      xperiod = 'M5';
      break;
    case '15':
      xperiod = 'M15';
      break;
    case '30':
      xperiod = 'M30';
      break;
    case '60':
      xperiod = 'H1';
      break;
    case '1440':
      xperiod = 'D1';
      break;
    case '1D':
    case 'D':
      xperiod = 'D1';
      break;
    case '1W':
      xperiod = 'D7';
      break;
    case '1M':
      xperiod = '1M';
      break;
  }
  subscribeCandles(pair, xperiod);
}

function unsubscribeCandleEvent() {
  if (!connectionFlag) {
    return;
  }
  unSubscribeCandles(candlePair, candlePeriod);
}


//
function barData(data) {
  let barsObject = {};
  let bars = [];
  for (let i = 0; i < data.length; i++) {
    let elem = data[i];
    let bar = {
      time: new Date(elem.timestamp).getTime(),
      close: Number(elem.close),
      open: Number(elem.open),
      high: Number(elem.max),
      low: Number(elem.min),
      volume: Number(elem.volume),
    };
    bars.push(JSON.parse(JSON.stringify(bar)));
  }

  let meta = {
    noData: true,
  };

  barsObject.meta = meta;
  barsObject.bars = bars;
  return JSON.parse(JSON.stringify(barsObject));
}

function updateBars(data) {

  for (let i = 0; i < data.length; i++) {
    let elem = data[i];
    let bar = {
      time: new Date(elem.timestamp).getTime(),
      close: Number(elem.close),
      open: Number(elem.open),
      high: Number(elem.max),
      low: Number(elem.min),
      volume: Number(elem.volume),
    };
    ExchangeDataEventBus.$emit('updateCandles', bar);
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
  'exchange-traded': 'bequant',
  'exchange-listed': 'bequant',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  minmov: 1,
  minmov2: 0,
  pointvalue: 1,
  session: '24x7',
  has_seconds: true,
  has_intraday: true,
  has_weekly_and_monthly: true,
  has_no_volume: false,
  description: 'Etherium on bequant',
  type: 'bitcoin',
  supported_resolutions: ['1', '5', '15', '30', '60', '1440', ],
  pricescale: 100,
  ticker: 'ETH',
  base_name: ['ETH', ],
  legs: ['BTC', ],
  exchange: 'bequant',
  full_name: 'bequant',
  pro_name: 'ETH',
  data_status: 'streaming',
};

let btcdata = {
  name: 'BTC/USD',
  'exchange-traded': 'bequant',
  'exchange-listed': 'bequant',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  minmov: 1,
  minmov2: 0,
  pointvalue: 1,
  session: '24x7',
  has_seconds: true,
  has_intraday: true,
  has_weekly_and_monthly: true,
  has_no_volume: false,
  description: 'bequant bitcoin prices',
  type: 'bitcoin',
  supported_resolutions: ['1', '5', '15', '30', '60', '1440', ],
  pricescale: 100,
  ticker: 'BTC',
  base_name: ['BTC', ],
  legs: ['BTC', ],
  exchange: 'bequant',
  full_name: 'bequant',
  pro_name: 'BTC',
  data_status: 'streaming',
};

let neodata = {
  name: 'NEO/USD',
  'exchange-traded': 'bequant',
  'exchange-listed': 'bequant',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  minmov: 1,
  minmov2: 0,
  pointvalue: 1,
  session: '24x7',
  has_seconds: true,
  has_intraday: true,
  has_weekly_and_monthly: true,
  has_no_volume: false,
  description: 'NEO on bequant',
  type: 'bitcoin',
  supported_resolutions: ['1', '5', '15', '30', '60', '1440', ],
  pricescale: 100,
  ticker: 'NEO',
  base_name: ['NEO', ],
  legs: ['NEO', ],
  exchange: 'bequant',
  full_name: 'bequant',
  pro_name: 'NEO',
  data_status: 'streaming',
};


function symboldata(symbol) {
  let pair = symbol.split('/')[0];
  let datareturn = {
    name: symbol,
    'exchange-traded': 'bequant',
    'exchange-listed': 'bequant',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    minmov: 1,
    minmov2: 0,
    pointvalue: 1,
    session: '24x7',
    has_seconds: true,
    has_intraday: true,
    has_weekly_and_monthly: true,
    has_no_volume: false,
    description: pair + ' on bequant',
    type: 'bitcoin',
    supported_resolutions: ['1', '5', '15', '30', '60', '1440', ],
    pricescale: 100,
    ticker: pair,
    base_name: [pair, ],
    legs: [pair, ],
    exchange: 'bequant',
    full_name: 'bequant',
    pro_name: pair,
    data_status: 'streaming',
  };
  return datareturn;
}


//new precesions
function roundPriceByPrecision(price, precision) {
  //returns price according to precesion
  let fractionDigits = precisionProps[precision].fractionDigits;
  let round = precisionProps[precision].round;
  if (round == 0) {
    return price.toFixed(fractionDigits);
  } else {
    return `${parseInt(price / round) * round}`;
  }
}

function groupSnapshotByPrecision(snapshot, snap) {
  snapshot.ask.forEach(i => {
    saveSnapshotData(P0Data, i, 'P0', 'ask');
    saveSnapshotData(P1Data, i, 'P1', 'ask');
    saveSnapshotData(P2Data, i, 'P2', 'ask');
    saveSnapshotData(P3Data, i, 'P3', 'ask');
  });


  snapshot.bid.forEach(i => {
    saveSnapshotData(P0Data, i, 'P0', 'bid');
    saveSnapshotData(P1Data, i, 'P1', 'bid');
    saveSnapshotData(P2Data, i, 'P2', 'bid');
    saveSnapshotData(P3Data, i, 'P3', 'bid');
  });
  getOrderBookArrayByPrecision(bookPrecision, snap);
}

function saveSnapshotData(dataObj, snapshotData, precision, askOrBid) {
  const roundedPrice = roundPriceByPrecision(parseFloat(snapshotData.price), precision);
  if (!dataObj[askOrBid][roundedPrice]) {
    dataObj[askOrBid][roundedPrice] = {
      data: {},
    };
    dataObj[askOrBid][roundedPrice].totalVolume = 0;

  }
  dataObj[askOrBid][roundedPrice].totalVolume = dataObj[askOrBid][roundedPrice].totalVolume -
        (dataObj[askOrBid][roundedPrice].data[snapshotData.price] || 0) +
        parseFloat(snapshotData.size);
  dataObj[askOrBid][roundedPrice].data[`${snapshotData.price}`] = parseFloat(snapshotData.size);

  if (parseFloat(snapshotData.size) === 0) {
    delete dataObj[askOrBid][roundedPrice].data[`${snapshotData.price}`];
  }
  if (dataObj[askOrBid][roundedPrice].totalVolume === 0) {
    delete dataObj[askOrBid][roundedPrice];
  }
}

function getPrecisionDataObjectFromPrecision(precesion) {
  switch (precesion) {
    case 'P0':
      return P0Data;
    case 'P1':
      return P1Data;
    case 'P2':
      return P2Data;
    case 'P3':
      return P3Data;
  }
}

function getOrderBookArrayByPrecision(precision, snapshot) {
  let pObj = getPrecisionDataObjectFromPrecision(precision);
  let chartData = {
    asks: [],
    bids: [],
  };
  Object.keys(pObj.ask).forEach(i => {
    if (parseFloat(pObj.ask[i].totalVolume) != 0) {
      chartData.asks.push({
        value: parseFloat(i),
        volume: parseFloat(pObj.ask[i].totalVolume),
      });
    }
  });
  Object.keys(pObj.bid).forEach(i => {
    if (parseFloat(pObj.bid[i].totalVolume) != 0) {
      chartData.bids.push({
        value: parseFloat(i),
        volume: parseFloat(pObj.bid[i].totalVolume),
      });
    }
  });
  chartData.asks.sort(function(a, b) {
    return a.value - b.value;
  });
  chartData.bids.sort(function(a, b) {
    return a.value - b.value;
  });
  chartData.asks = chartData.asks.filter(i => i.volume > 0.00001 && i.value > 0.0001).splice(0, 25);
  chartData.bids = chartData.bids.filter(i => i.volume > 0.00001 && i.value > 0.0001).splice(-25);
  if (snapshot) {
    ExchangeDataEventBus.$emit('snapshotOrderbook', JSON.parse(JSON.stringify(chartData)));
  } else {
    ExchangeDataEventBus.$emit('updateOrderbook', JSON.parse(JSON.stringify(chartData)));
  }
  return chartData;
}


function updatePrecisionGrouping(data) {
  let pair = currentPair.split('/')[1];
  if (pair == 'BTC') {
    precisionProps = {
      P0: {
        'fractionDigits': 5,
        'round': 0,
      },
      P1: {
        'fractionDigits': 4,
        'round': 0,
      },
      P2: {
        'fractionDigits': 3,
        'round': 0,
      },
      P3: {
        'fractionDigits': 2,
        'round': 0,
      },
    };
  } else {
    let value = '' + data.ask[0].price;
    let numLen = (value).split('.')[0].length;
    if (numLen > 2) {
      precisionProps = {
        P0: {
          'fractionDigits': 1,
          'round': 0,
        },
        P1: {
          'fractionDigits': 1,
          'round': 1,
        },
        P2: {
          'fractionDigits': 1,
          'round': 10,
        },
        P3: {
          'fractionDigits': 1,
          'round': 100,
        },
      };
    } else if (numLen == 2) {
      precisionProps = {
        P0: {
          'fractionDigits': 3,
          'round': 0,
        },
        P1: {
          'fractionDigits': 2,
          'round': 0,
        },
        P2: {
          'fractionDigits': 1,
          'round': 0,
        },
        P3: {
          'fractionDigits': 1,
          'round': 1,
        },
      };
    } else if (numLen == 1) {
      precisionProps = {
        P0: {
          'fractionDigits': 4,
          'round': 0,
        },
        P1: {
          'fractionDigits': 3,
          'round': 0,
        },
        P2: {
          'fractionDigits': 2,
          'round': 0,
        },
        P3: {
          'fractionDigits': 1,
          'round': 0,
        },
      };
    } else if (numLen == 0) {
      precisionProps = {
        P0: {
          'fractionDigits': 5,
          'round': 0,
        },
        P1: {
          'fractionDigits': 4,
          'round': 0,
        },
        P2: {
          'fractionDigits': 3,
          'round': 0,
        },
        P3: {
          'fractionDigits': 2,
          'round': 0,
        },
      };
    }
  }

}

function resetData() {
  bookPrecision = 'P1';
  P0Data = {
    ask: {},
    bid: {},
  };
  P1Data = {
    ask: {},
    bid: {},
  };
  P2Data = {
    ask: {},
    bid: {},
  };
  P3Data = {
    ask: {},
    bid: {},
  };
}
