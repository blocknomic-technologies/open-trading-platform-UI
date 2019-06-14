import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import {
  dateToDisplayTime,
} from '@/utils/utility';

let newws = {
  readyState: 3,
};
let chartData = {};
let defaultPair = 'BTC/USD';
let bookPrecision = 'P2';
let currentPair = defaultPair;
let candlesChanId;
let tradesChanId;
let bookChanId;
let tickerChanId;
let connectionFlag = false;
let candlesIdArray = [];
class BitfinexSocket {
  connect() {
    bitfinexConnect(currentPair);
  }
}

let instance = new BitfinexSocket();

ExchangeDataEventBus.$on('exchange-connect', instance.connect);
ExchangeDataEventBus.$on('precision', changePrecision);

function bitfinexConnect() {
  newws = new WebSocket('wss://api.bitfinex.com/ws/2');
  // let pair = currentPair.replace('/', '');
  newws.onopen = () => {
    // console.log('Connected to Bitfinex');
    //subscribePair(pair);
    ExchangeDataEventBus.$emit('exchange-connected');

  };
  newws.onclose = () => {
    // console.log('Disconnected From BitFinex');
  };

  newws.onerror = () => {
    // console.log('Error from Bitfinex:' + err);
  };
  newws.onmessage = (msg) => {
    //console.log('Message from BitFinex: ' + msg.data);
    let dataObj = JSON.parse(msg.data);
    sendData(dataObj);
  };
}

ExchangeDataEventBus.$on('subscribe-exchange', function subscribeExchange(exchange) {
  // console.log('subscribing exchange:', exchange);
  chartData = {};
  //let pair = currentPair.replace('/', '');
  if (exchange == 'bitfinex') {
    subscribePair(currentPair);
    connectionFlag = true;
  } else {
    if (connectionFlag) {
      unsubscribe();
      connectionFlag = false;
    }
  }
});

ExchangeDataEventBus.$on('subscribe-all-ticker', async function subscribeAllTicker() {
  let pair = currentPair.replace('/', '');
  // console.log('ready state:', WebSocket.OPEN, newws.readyState);
  let timerId;

  const handler = () => {
    if (WebSocket.OPEN == newws.readyState) {
      subscribeTicker(pair, 'P0');
      clearInterval(timerId);
    }
  };
  timerId = setInterval(handler, 500);

});
ExchangeDataEventBus.$on('unsubscribe-all-ticker', function unsubscribeAllTicker() {
  // let pair = currentPair.replace('/', '');
  unsubscribe(tickerChanId);
});

function subscribePair(Cpair) {
  let pair = Cpair.replace('/', '');
  subscribeOrderBook(pair, bookPrecision);
  //subscribeTicker(pair, 'P0');
  subscribeTrades(pair);
  //subscribeCandles(pair, '1m');
}

ExchangeDataEventBus.$on('change-symbol', function (pair) {
  chartData = {};
  // console.log('symbol change called:', pair);
  if (pair == 'QTUM/USD') {
    pair = 'QTM/USD';
  } else if (pair == 'QTUM/BTC') {
    pair = 'QTM/BTC';
  } else if (pair == 'DASH/BTC') {
    pair = 'DSH/BTC';
  } else if (pair == 'DASH/USD') {
    pair = 'DSH/USD';
  } else if (pair == 'IOTA/USD') {
    pair = 'IOT/USD';
  }
  changeTickerPair(pair);
  changePair(pair);
});

function changeTickerPair(pair) {
  unsubscribe(tickerChanId);
  let Cpair = pair.replace('/', '');
  subscribeTicker(Cpair, 'P0');
  return;
}

function changePair(pair) {
  bookPrecision = 'P2';
  currentPair = pair;
  if (!connectionFlag) {
    // console.log('bitfinex not active returning');
    return;
  }
  // let unPair = currentPair || defaultPair;
  //currentPair = pair;
  unsubscribe();
  subscribePair(pair);
}

function subscribeOrderBook(Pair, precesion) {
  // console.log('subscribing order book');
  let pair = `t${Pair}`;
  let data = {
    event: 'subscribe',
    channel: 'book',
    symbol: pair,
    prec: precesion,
    //len: '20',
  };
  newws.send(JSON.stringify(data));
}

function subscribeTicker(Pair, precesion) {
  let pair = `t${Pair}`;
  let data = {
    event: 'subscribe',
    channel: 'ticker',
    symbol: pair,
    precision: precesion,
  };
  newws.send(JSON.stringify(data));
}

function subscribeTrades(Pair) {
  let pair = `t${Pair}`;
  let data = {
    event: 'subscribe',
    channel: 'trades',
    symbol: pair,
  };
  newws.send(JSON.stringify(data));
}

function subscribeCandles(Pair, timeFrame) {
  let pairKey = `trade:${timeFrame}:t${Pair}`;
  let data = {
    event: 'subscribe',
    channel: 'candles',
    key: pairKey,
  };
  newws.send(JSON.stringify(data));
}

function unsubscribe(key) {
  if (!key) {
    [tradesChanId, bookChanId, ...candlesIdArray, ].forEach(function (elem) {
      // console.log('id:', elem);
      let data = {
        'event': 'unsubscribe',
        'chanId': elem,
      };
      newws.send(JSON.stringify(data));
    });
  } else {
    let data = {
      'event': 'unsubscribe',
      'chanId': key,
    };
    newws.send(JSON.stringify(data));
  }
}

function sendData(dataObj) {
  let event = dataObj.event;
  if (event) {
    switch (event) {
      case 'info':
        if (dataObj.code) {
          if (dataObj.code == 20051) {
            newws.close();
            subscribePair(defaultPair);
          }
        }
        break;
      case 'subscribed':
        if (dataObj.channel === 'trades') {
          tradesChanId = dataObj.chanId;
        } else if (dataObj.channel === 'candles') {
          candlesChanId = dataObj.chanId;
          candlesIdArray.push(dataObj.chanId);
        } else if (dataObj.channel === 'book') {
          bookChanId = dataObj.chanId;
        } else if (dataObj.channel === 'ticker') {
          tickerChanId = dataObj.chanId;
        }
        break;
      case 'default':
        break;
    }
  } else {
    let response = dataObj;
    if (response[0] == tradesChanId) {
      if (response[1] == 'tu') {
        emitLiveTrades(response[2], false);
      } else if (Array.isArray(response[1])) {
        // console.log('snapshot live trades:', response[1]);
        emitLiveTrades(response[1], true);
      }
    } else if (response[0] == bookChanId) {
      let data = response[1];
      emitBooks(data);
    } else if (response[0] == candlesChanId) {
      if (response[1] != 'hb') {
        if (Array.isArray(response[1][0])) {
          let barArray = barData(response[1]);
          ExchangeDataEventBus.$emit('snapshotCandles', barArray);
        } else {
          updateBars(response[1]);
        }
      }

    } else if (response[0] == tickerChanId) {
      if (response[1] != 'hb') {
        makeTickerResponse(response[1]);
      }
    }

  }
}


function emitLiveTrades(data, isSnapShot) {

  if (isSnapShot) {
    let arr = data.map((elem) => {
      let obj = {};
      obj.price = Number((elem[3]).toFixed(2));
      obj.timeStamp = dateToDisplayTime(new Date(elem[1]));
      obj.volume = Math.abs(elem[2]);
      obj.buyOrSell = elem[2] < 0 ? 'sell' : 'buy';
      return obj;
    });
    ExchangeDataEventBus.$emit('liveTrades', arr[1]);
    ExchangeDataEventBus.$emit('snapshotTrades', arr);

  } else {
    let arr = [];
    let obj = {};
    obj.price = Number((data[3]).toFixed(2));
    obj.timeStamp = dateToDisplayTime(new Date(data[1]));
    obj.volume = Math.abs(data[2]);
    obj.buyOrSell = data[2] < 0 ? 'sell' : 'buy';
    arr.push(obj);
    ExchangeDataEventBus.$emit('liveTrades', obj);
  }
}

function emitBooks(data) {
  if (data != 'hb') {
    if (Array.isArray(data[0])) {

      let asks = [];
      let bids = [];
      data.forEach((item) => {
        if (item[2] > 0) {
          let localData = {};
          localData.value = item[0];
          localData.volume = Number(Math.abs(item[2]).toFixed(3));
          bids.push(localData);
        } else {
          let localData = {};
          localData.value = item[0];
          localData.volume = Number(Math.abs(item[2]).toFixed(3));
          asks.push(localData);
        }
      });
      asks.sort(function (a, b) {
        return a.value - b.value;
      });
      bids.sort(function (a, b) {
        return a.value - b.value;
      });

      chartData.asks = asks;
      chartData.bids = bids;
      ExchangeDataEventBus.$emit('snapshotOrderbook', JSON.parse(JSON.stringify(chartData)));

    } else {
      if (chartData.asks && chartData.bids) {
        if (data[2] > 0) {
          let flag = 0;
          chartData.bids.forEach(function (elem, index) {
            if (elem.value == data[0]) {
              if (data[1] == 0 && data[2] == 1) {
                chartData.bids.splice(index, 1);
              } else {
                chartData.bids[index].volume = Number(data[2].toFixed(3));
              }
              flag = 1;
            }
            if (index == (chartData.bids.length - 1) && (flag == 0)) {
              if (data[2] != 1) {
                let localData = {};
                localData.value = data[0];
                localData.volume = Number(data[2].toFixed(3));
                chartData.bids.push(localData);
                chartData.bids.sort(function (a, b) {
                  return a.value - b.value;
                });
                //chartData.bids.pop();
              }
            }
          });
        } else {
          let flag = 0;
          chartData.asks.forEach(function (elem, index) {
            if (elem.value == data[0]) {
              if (data[1] == 0 && data[2] == -1) {
                chartData.asks.splice(index, 1);
              } else {
                chartData.asks[index].volume = Number(Math.abs(data[2]).toFixed(3));
              }
              flag = 1;
            }
            if (index == (chartData.asks.length - 1) && (flag == 0)) {
              if (data[2] != -1) {
                let localData = {};
                localData.value = data[0];
                localData.volume = Number(Math.abs(data[2]).toFixed(3));
                chartData.asks.push(localData);
                chartData.asks.sort(function (a, b) {
                  return a.value - b.value;
                });
                //chartData.asks.pop();
              }
            }
          });
        }

        if (chartData.asks.length > 9 && chartData.bids.length > 9) {
          ExchangeDataEventBus.$emit('updateOrderbook', JSON.parse(JSON.stringify(chartData)));
        } else {
          refreshOrderBook();
        }
      }
    }
  }
}

function refreshOrderBook() {
  unsubscribe(bookChanId);
  let pair = currentPair.replace('/', '');
  subscribeOrderBook(pair, bookPrecision);
}

function makeTickerResponse(data) {
  let obj = {};
  obj.ask = data[2];
  obj.bid = data[0];
  obj.high = data[8];
  obj.low = data[9];
  obj.last = data[6];
  obj.volume = (data[7]);
  obj.symbol = currentPair;
  obj.percentage = (data[5] * 100);
  obj.exchange = 'bitfinex';
  ExchangeDataEventBus.$emit('ticker', obj);
}

function changePrecision(key) {
  if (!connectionFlag) {
    return;
  }
  unsubscribe(bookChanId);
  let keys = ['P0', 'P1', 'P2', 'P3', ];
  let index = keys.indexOf(bookPrecision);
  if (key == 'minus') {
    if (index != 0) {
      bookPrecision = keys[index - 1];
    }
  } else {
    if (index != 3) {
      bookPrecision = keys[index + 1];
    }
  }
  let pair = currentPair.replace('/', '');
  subscribeOrderBook(pair, bookPrecision);
}

ExchangeDataEventBus.$on('subscribe-candles', subscribeCandleEvent);
ExchangeDataEventBus.$on('unsubscribe-candles', unsubscribeCandleEvent);
ExchangeDataEventBus.$on('resolve-candle-symbol', resolveSymbolFn);

function subscribeCandleEvent(info) {
  let symbol = info.symbol.name;
  if (symbol == 'QTUM/USD') {
    symbol = 'QTM/USD';
  } else if (symbol == 'QTUM/BTC') {
    symbol = 'QTM/BTC';
  } else if (symbol == 'DASH/BTC') {
    symbol = 'DSH/BTC';
  } else if (symbol == 'DASH/USD') {
    symbol = 'DSH/USD';
  } else if (symbol == 'IOTA/USD') {
    symbol = 'IOT/USD';
  }
  let period = info.period;
  // console.log('subscribing candles:', info);
  if (!connectionFlag) {
    return;
  }

  let pair = symbol.replace('/', '');

  let xperiod = '1m';

  switch (period) {
    case '1':
      xperiod = '1m';
      break;
    case '5':
      xperiod = '5m';
      break;
    case '15':
      xperiod = '15m';
      break;
    case '30':
      xperiod = '30m';
      break;
    case '60':
      xperiod = '1h';
      break;
    case '1D':
    case 'D':
      xperiod = '1D';
      break;
    case '1W':
      xperiod = '7D';
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
  unsubscribe(candlesChanId);
}

function barData(data) {
  let barsObject = {};
  let bars = [];
  for (let i = data.length - 1; i >= 0; i--) {
    let elem = data[i];
    let bar = {
      time: elem[0],
      close: Number(elem[2]),
      open: Number(elem[1]),
      high: Number(elem[3]),
      low: Number(elem[4]),
      volume: Number(elem[5]),
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
let previousTime = Date.now() - 1000;
function updateBars(data) {
  let elem = data;
  
  let bar = {
    time: elem[0],
    close: Number(elem[2]),
    open: Number(elem[1]),
    high: Number(elem[3]),
    low: Number(elem[4]),
    volume: Number(elem[5]),
  };
  if(Number(bar.time) >= previousTime) {
    ExchangeDataEventBus.$emit('updateCandles', bar);
    previousTime  = Number(bar.time);
  }  
}

function resolveSymbolFn(symbol) {
  if (!connectionFlag) {
    return;
  }
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
  'exchange-traded': 'bitfinex',
  'exchange-listed': 'bitfinex',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  minmov: 1,
  minmov2: 0,
  pointvalue: 1,
  session: '24x7',
  has_seconds: true,
  has_intraday: true,
  has_weekly_and_monthly: true,
  has_no_volume: false,
  description: 'Etherium on bitfinex',
  type: 'bitcoin',
  supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M', ],
  pricescale: 100,
  ticker: 'ETH',
  base_name: ['ETH', ],
  legs: ['BTC', ],
  exchange: 'bitfinex',
  full_name: 'bitfinex',
  pro_name: 'ETH',
  data_status: 'streaming',
};

let btcdata = {
  name: 'BTC/USD',
  'exchange-traded': 'bitfinex',
  'exchange-listed': 'bitfinex',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  minmov: 1,
  minmov2: 0,
  pointvalue: 1,
  session: '24x7',
  has_seconds: true,
  has_intraday: true,
  has_weekly_and_monthly: true,
  has_no_volume: false,
  description: 'bitfinex bitcoin prices',
  type: 'bitcoin',
  supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M', ],
  pricescale: 100,
  ticker: 'BTC',
  base_name: ['BTC', ],
  legs: ['BTC', ],
  exchange: 'bitfinex',
  full_name: 'bitfinex',
  pro_name: 'BTC',
  data_status: 'streaming',
};

let neodata = {
  name: 'NEO/USD',
  'exchange-traded': 'bitfinex',
  'exchange-listed': 'bitfinex',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  minmov: 1,
  minmov2: 0,
  pointvalue: 1,
  session: '24x7',
  has_seconds: true,
  has_intraday: true,
  has_weekly_and_monthly: true,
  has_no_volume: false,
  description: 'NEO on bitfinex',
  type: 'bitcoin',
  supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M', ],
  pricescale: 100,
  ticker: 'NEO',
  base_name: ['NEO', ],
  legs: ['NEO', ],
  exchange: 'bitfinex',
  full_name: 'bitfinex',
  pro_name: 'NEO',
  data_status: 'streaming',
};

function symboldata(symbol) {
  let pair = symbol.split('/')[0];
  let datareturn = {
    name: symbol,
    'exchange-traded': 'bitfinex',
    'exchange-listed': 'bitfinex',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    minmov: 1,
    minmov2: 0,
    pointvalue: 1,
    session: '24x7',
    has_seconds: true,
    has_intraday: true,
    has_weekly_and_monthly: true,
    has_no_volume: false,
    description: pair + ' on bitfinex',
    type: 'bitcoin',
    supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M', ],
    pricescale: 100,
    ticker: pair,
    base_name: [pair, ],
    legs: [pair, ],
    exchange: 'bitfinex',
    full_name: 'bitfinex',
    pro_name: pair,
    data_status: 'streaming',
  };
  return datareturn;
}

ExchangeDataEventBus.$on('get-all-symbols', symbolData);

function symbolData() {
  // console.log('symbol data called');
  if (!connectionFlag) {
    return;
  }
  let arr = ['btcusd', 'ltcusd', 'ltcbtc', 'ethusd', 'ethbtc', 'etcbtc', 'etcusd', 'rrtusd', 'rrtbtc', 'zecusd', 'zecbtc', 'xmrusd', 'xmrbtc', 'dshusd', 'dshbtc', 'btceur', 'btcjpy', 'xrpusd', 'xrpbtc', 'iotusd', 'iotbtc', 'ioteth', 'eosusd', 'eosbtc', 'eoseth', 'sanusd', 'sanbtc', 'saneth', 'omgusd', 'omgbtc', 'omgeth', 'bchusd', 'bchbtc', 'bcheth', 'neousd', 'neobtc', 'neoeth', 'etpusd', 'etpbtc', 'etpeth', 'qtmusd', 'qtmbtc', 'qtmeth', 'avtusd', 'avtbtc', 'avteth', 'edousd', 'edobtc', 'edoeth', 'btgusd', 'btgbtc', 'datusd', 'datbtc', 'dateth', 'qshusd', 'qshbtc', 'qsheth', 'yywusd', 'yywbtc', 'yyweth', 'gntusd', 'gntbtc', 'gnteth', 'sntusd', 'sntbtc', 'snteth', 'ioteur', 'batusd', 'batbtc', 'bateth', 'mnausd', 'mnabtc', 'mnaeth', 'funusd', 'funbtc', 'funeth', 'zrxusd', 'zrxbtc', 'zrxeth', 'tnbusd', 'tnbbtc', 'tnbeth', 'spkusd', 'spkbtc', 'spketh', 'trxusd', 'trxbtc', 'trxeth', 'rcnusd', 'rcnbtc', 'rcneth', 'rlcusd', 'rlcbtc', 'rlceth', 'aidusd', 'aidbtc', 'aideth', 'sngusd', 'sngbtc', 'sngeth', 'repusd', 'repbtc', 'repeth', 'elfusd', 'elfbtc', 'elfeth', 'btcgbp', 'etheur', 'ethjpy', 'ethgbp', 'neoeur', 'neojpy', 'neogbp', 'eoseur', 'eosjpy', 'eosgbp', 'iotjpy', 'iotgbp', 'iosusd', 'iosbtc', 'ioseth', 'aiousd', 'aiobtc', 'aioeth', 'requsd', 'reqbtc', 'reqeth', 'rdnusd', 'rdnbtc', 'rdneth', 'lrcusd', 'lrcbtc', 'lrceth', 'waxusd', 'waxbtc', 'waxeth', 'daiusd', 'daibtc', 'daieth', 'cfiusd', 'cfibtc', 'cfieth', 'agiusd', 'agibtc', 'agieth', 'bftusd', 'bftbtc', 'bfteth', 'mtnusd', 'mtnbtc', 'mtneth', 'odeusd', 'odebtc', 'odeeth', 'antusd', 'antbtc', 'anteth', 'dthusd', 'dthbtc', 'dtheth', 'mitusd', 'mitbtc', 'miteth', 'stjusd', 'stjbtc', 'stjeth', 'xlmusd', 'xlmeur', 'xlmjpy', 'xlmgbp', 'xlmbtc', 'xlmeth', 'xvgusd', 'xvgeur', 'xvgjpy', 'xvggbp', 'xvgbtc', 'xvgeth', 'bciusd', 'bcibtc', 'mkrusd', 'mkrbtc', 'mkreth', 'venusd', 'venbtc', 'veneth', 'kncusd', 'kncbtc', 'knceth', 'poausd', 'poabtc', 'poaeth', ];
  let newArray = [];
  arr.forEach(elem => {
    let sym = elem.substr(0, 3).toUpperCase();
    let pair = elem.substr(3, 3).toUpperCase();
    let obj = {
      symbol: sym + '/' + pair,
      full_name: sym,
      description: '',
      type: sym,
      exchange: 'bitfinex',
    };
    newArray.push(obj);
  });
  //emit event for symbol data
  ExchangeDataEventBus.$emit('all-symbols', newArray);
}
