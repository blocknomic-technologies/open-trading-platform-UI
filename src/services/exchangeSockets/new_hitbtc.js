import store from '@/store';
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import Worker from 'simple-web-worker';
import serialize from 'serialize-javascript';
import keyMaps from '@/assets/json/keyMaps.js';
import reverseKeyMaps from '@/assets/json/reverseKeyMaps.js';
import {
  dateToDisplayTime,
} from '@/utils/utility';

class bequant {
  constructor() {
    this.ExchangeDataEventBus = ExchangeDataEventBus;
    this.state = {
      _constants: {
        selectedExchange: store.getters.selectedExchange,
        // selectedPair: store.getters.selectedPair,
        defaultPair: 'BTC/USD',
        selectedPair: 'BTC/USD',
        baseAddress: 'wss://api.bequant.com/api/2/ws',
        candlePeriod: 'M1',
        candlePair: '',
        precision: 'P1',
        P0Data: {
          ask: {},
          bid: {},
        },
        P1Data: {
          ask: {},
          bid: {},
        },
        P2Data: {
          ask: {},
          bid: {},
        },
        P3Data: {
          ask: {},
          bid: {},
        },
        precisionProps: {
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
        },
        ethdata: {
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
        },
        btcdata: {
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
        },
        neodata: {
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
        },
      },
      unsubscribeObject: {},
      connectionFlag: false,
    };
    this.actions = [{
      message: 'emit-trades',
      func: this.processEmitTrades,
      // }, {
      //   message: 'ask-group-precision',
      //   func: this.processAskSnapshotByPrecision,
      // }, {
      //   message: 'bid-group-precision',
      //   func: this.processBidSnapshotByPrecision,
      // }, {
      //   message: 'order-book-array-precision',
      //   func: this.processOrderBookArrayByPrecision,
    }, {
      message: 'process-bar-data',
      func: this.processBarData,
    }, ];
    this.workers = Worker.create(this.actions);
    this.ctx = {
      close() {},
      readyState: 3,
    };
    this.initListeners();
  }

  connect() {
    const {
      _constants,
    } = this.state;
    let bequant = new WebSocket(_constants.baseAddress);
    bequant.onopen = this.handleOpen;
    bequant.onmessage = (message) => this.handleMessage(message);
    bequant.onerror = this.handleError;
    bequant.onclose = () => this.handleClose();
    this.ctx.close();

    this.ctx = bequant;
  }

  handleOpen() {}

  handleClose() {}

  handleError() {}

  handleMessage(message) {
    let data = JSON.parse(message.data);

    this.processMessage(data);
  }

  unsubscribeOrphaned() {
    const {
      unsubscribeObject,
    } = this.state;
    const self = this;
    if (Object.keys(unsubscribeObject).length > 0) {
      Object.keys(unsubscribeObject).forEach(elem => {
        let split = elem.split('-');
        let pair = split[1];
        let service = split[0];
        switch (service) {
          case 'orderBook':
            self.unSubscribeOrderBook(pair);
            break;
          case 'ticker':
            self.unSubscribeTicker(pair);
            break;
          case 'trades':
            self.unSubscribeTrades(pair);
            break;
          case 'candles':
            self.unSubscribeCandles(pair, split[2]);
            break;
        }
      });
    }
  }

  unSubscribeOrderBook(pair) {
    this.state.unsubscribeObject['orderBook-' + pair] = true;
    let order_book = {
      'method': 'unsubscribeOrderbook',
      'params': {
        'symbol': pair,
      },
      'id': 'orderBook-' + pair,
    };
    this.ctx.send(JSON.stringify(order_book));
  }

  unSubscribeTicker(pair) {
    this.state.unsubscribeObject['ticker-' + pair] = true;
    let ticker = {
      'method': 'unsubscribeTicker',
      'params': {
        'symbol': pair,
      },
      'id': 'ticker-' + pair,
    };
    this.ctx.send(JSON.stringify(ticker));
  }

  unSubscribeTrades(pair) {
    this.state.unsubscribeObject['trades-' + pair] = true;
    let trades = {
      'method': 'unsubscribeTrades',
      'params': {
        'symbol': pair,
      },
      'id': 'trades-' + pair,
    };
    this.ctx.send(JSON.stringify(trades));
  }

  unSubscribeCandles(pair, period) {
    this.state.unsubscribeObject['candles-' + pair + '-' + period] = true;
    let candles = {
      'method': 'unsubscribeCandles',
      'params': {
        'symbol': pair,
        'period': period,
      },
      'id': 'candles-' + pair,
    };
    this.ctx.send(JSON.stringify(candles));
  }

  unsubscribePair(Cpair) {
    let pair = keyMaps['bequant-_-' + Cpair];
    this.unSubscribeOrderBook(pair);
    this.unSubscribeTrades(pair);
    this.unSubscribeCandles(pair, this.state._constants.candlePeriod);
  }

  subscribePair(pair) {
    this.subscribeOrderBook(pair);
    this.subscribeTrades(pair);
    this.subscribeCandles(pair, this.state._constants.candlePeriod);
  }

  subscribeOrderBook(pair) {
    let order_book = {
      'method': 'subscribeOrderbook',
      'params': {
        'symbol': pair,
      },
      'id': 'orderBook-' + pair,
    };

    this.ctx.send(JSON.stringify(order_book));
  }

  subscribeTicker(pair) {
    let ticker = {
      'method': 'subscribeTicker',
      'params': {
        'symbol': pair,
      },
      'id': 'subscribeTicker-' + pair,
    };
    this.ctx.send(JSON.stringify(ticker));
  }

  subscribeTrades(pair) {
    let trades = {
      'method': 'subscribeTrades',
      'params': {
        'symbol': pair,
      },
      'id': 'subscribeTrades-' + pair,
    };
    this.ctx.send(JSON.stringify(trades));
  }

  subscribeCandles(pair, period) {
    this.state._constants.candlePair = pair;
    this.state._constants.candlePeriod = period;
    let candles = {
      'method': 'subscribeCandles',
      'params': {
        'symbol': pair,
        'period': period,
      },
      'id': 'subscribeCandles-' + pair,
    };
    this.ctx.send(JSON.stringify(candles));
  }

  changeTickerPair(pair) {
    let lspair = keyMaps['bequant-_-' + this.state._constants.selectedPair];
    this.state._constants.selectedPair = pair;
    this.unSubscribeTicker(lspair);
    if (!this.state.connectionFlag) {
      this.state._constants.selectedPair = pair;
    }
    let Cpair = keyMaps['bequant-_-' + pair];
    this.subscribeTicker(Cpair);
  }

  changePair(pair) {
    if (!this.state._constants.connectionFlag) {
      this.unsubscribeOrphaned();
      return;
    }
    let unPair = this.state._constants.selectedPair || this.state._constants.defaultPair;
    this.state._constants.selectedPair = pair;
    let Cpair = keyMaps['bequant-_-' + pair];
    this.unsubscribePair(unPair);
    this.subscribePair(Cpair);
    // this.state._constants.selectedPair = pair;
  }

  processEmitTrades(data, length, obj) {
    const E = eval('(' + obj + ')');
    let arr = data.slice(-100).map((elem) => {
      let obj = {};
      obj.price = parseFloat(elem.price).toFixed(length);
      obj.timeStamp = E.utils.dateToDisplayTime(new Date(elem.timestamp));
      obj.volume = parseFloat(elem.quantity);
      obj.buyOrSell = elem.side;
      return obj;
    }).reverse();
    return arr;
  }

  emitLiveTrades(data, isSnapShot) {
    let length = 1;
    let pair = this.state._constants.selectedPair.split('/')[1];
    if (pair == 'BTC') {
      length = 5;
    }
    if (isSnapShot) {
      this.workers.postMessage('emit-trades', [data, length, serialize({
        fns: {},
        utils: {
          dateToDisplayTime,
        },
      }), ]).then(data => {
        this.ExchangeDataEventBus.$emit('liveTrades', data[1]);
        this.ExchangeDataEventBus.$emit('snapshotTrades', data);
      }).catch(() => {});
    } else {
      const self = this;
      data.forEach((elem) => {
        let obj = {};
        obj.price = parseFloat(elem.price).toFixed(length);
        obj.timeStamp = dateToDisplayTime(new Date(elem.timestamp));
        obj.volume = parseFloat(elem.quantity);
        obj.buyOrSell = elem.side;
        self.ExchangeDataEventBus.$emit('liveTrades', obj);
      });
    }
  }

  makeTickerResponse(data) {
    let obj = {};
    obj.ask = data.ask;
    obj.bid = data.bid;
    obj.high = data.high;
    obj.low = data.low;
    obj.last = data.last;
    obj.volume = data.volume;
    obj.symbol = data.symbol;
    obj.percentage = (((data.last - data.open) / data.open) * 100);
    obj.exchange = 'bequant';
    this.ExchangeDataEventBus.$emit('ticker', obj);
  }

  resetData() {
    const {
      _constants,
    } = this.state;
    _constants.precision = 'P2';
    _constants.P0Data = {
      ask: {},
      bid: {},
    };
    _constants.P1Data = {
      ask: {},
      bid: {},
    };
    _constants.P2Data = {
      ask: {},
      bid: {},
    };
    _constants.P3Data = {
      ask: {},
      bid: {},
    };
  }

  updatePrecisionGrouping(data) {
    const {
      _constants,
    } = this.state;
    let pair = _constants.selectedPair.split('/')[1];
    if (pair == 'BTC') {
      _constants.precisionProps = {
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
        _constants.precisionProps = {
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
        _constants.precisionProps = {
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
        _constants.precisionProps = {
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
        _constants.precisionProps = {
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

  roundPriceByPrecision(price, precision, precisionProps) {
    let fractionDigits = precisionProps[precision].fractionDigits;
    let round = precisionProps[precision].round;
    if (round == 0) {
      return price.toFixed(fractionDigits);
    } else {
      return `${parseInt(price / round) * round}`;
    }
  }

  saveSnapshotData(dataObj, snapshotData, precision, askOrBid) {
    const roundedPrice = this.roundPriceByPrecision(parseFloat(snapshotData.price), precision, this.state._constants.precisionProps);
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
    return dataObj;
  }

  processAskSnapshotByPrecision(snapshot, state, obj) {
    const E = eval('(' + obj + ')');
    let {
      P0Data,
      P1Data,
      P2Data,
      P3Data,
    } = state._constants;
    snapshot.ask.forEach(i => {
      P0Data = E.fns.saveSnapshotData(P0Data, i, 'P0', 'ask', state._constants.precisionProps);
      P1Data = E.fns.saveSnapshotData(P1Data, i, 'P1', 'ask', state._constants.precisionProps);
      P2Data = E.fns.saveSnapshotData(P2Data, i, 'P2', 'ask', state._constants.precisionProps);
      P3Data = E.fns.saveSnapshotData(P3Data, i, 'P3', 'ask', state._constants.precisionProps);
    });
    return {
      P0Data,
      P1Data,
      P2Data,
      P3Data,
    };
  }

  processBidSnapshotByPrecision(snapshot, state, obj) {
    const E = eval('(' + obj + ')');
    let {
      P0Data,
      P1Data,
      P2Data,
      P3Data,
    } = state._constants;
    snapshot.ask.forEach(i => {
      P0Data = E.fns.saveSnapshotData(P0Data, i, 'P0', 'bid', state._constants.precisionProps, E.utils.roundPriceByPrecision);
      P1Data = E.fns.saveSnapshotData(P1Data, i, 'P1', 'bid', state._constants.precisionProps, E.utils.roundPriceByPrecision);
      P2Data = E.fns.saveSnapshotData(P2Data, i, 'P2', 'bid', state._constants.precisionProps, E.utils.roundPriceByPrecision);
      P3Data = E.fns.saveSnapshotData(P3Data, i, 'P3', 'bid', state._constants.precisionProps, E.utils.roundPriceByPrecision);
    });
    return {
      P0Data,
      P1Data,
      P2Data,
      P3Data,
    };
  }

  getPrecisionDataObjectFromPrecision(precision) {
    const {
      P0Data,
      P1Data,
      P2Data,
      P3Data,
    } = this.state._constants;
    switch (precision) {
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

  getOrderBookArrayByPrecision(precision, snapshot) {
    let pObj = this.getPrecisionDataObjectFromPrecision(precision);
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
    chartData.asks.sort(function (a, b) {
      return a.value - b.value;
    });
    chartData.bids.sort(function (a, b) {
      return a.value - b.value;
    });
    chartData.asks = chartData.asks.slice(0, 100).filter(i => i.volume !== 0 && i.value !== 0);
    chartData.bids = chartData.bids.slice(-100).filter(i => i.volume !== 0 && i.value !== 0);
    if (snapshot) {
      this.ExchangeDataEventBus.$emit('snapshotOrderbook', JSON.parse(JSON.stringify(chartData)));
    } else {
      this.ExchangeDataEventBus.$emit('updateOrderbook', JSON.parse(JSON.stringify(chartData)));
    }
    return chartData;
  }

  processOrderBookArrayByPrecision(state, obj) {
    const E = eval('(' + obj + ')');
    const PData = {
      P0Data: state._constants.P0Data,
      P1Data: state._constants.P1Data,
      P2Data: state._constants.P2Data,
      P3Data: state._constants.P3Data,
    };
    let pObj = E.fns.getPrecisionDataObjectFromPrecision(PData, state._constants.precision);
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
    chartData.asks.sort(function (a, b) {
      return a.value - b.value;
    });
    chartData.bids.sort(function (a, b) {
      return a.value - b.value;
    });
    chartData.asks = chartData.asks.slice(0, 100).filter(i => i.volume !== 0 && i.value !== 0);
    chartData.bids = chartData.bids.slice(-100).filter(i => i.volume !== 0 && i.value !== 0);
    return chartData;
  }

  groupSnapshotByPrecision(snapshot, snap) {
    const {
      P0Data,
      P1Data,
      P2Data,
      P3Data,
      precision,
    } = this.state._constants;
    snapshot.ask.forEach(i => {
      this.saveSnapshotData(P0Data, i, 'P0', 'ask');
      this.saveSnapshotData(P1Data, i, 'P1', 'ask');
      this.saveSnapshotData(P2Data, i, 'P2', 'ask');
      this.saveSnapshotData(P3Data, i, 'P3', 'ask');
    });
    snapshot.bid.forEach(i => {
      this.saveSnapshotData(P0Data, i, 'P0', 'bid');
      this.saveSnapshotData(P1Data, i, 'P1', 'bid');
      this.saveSnapshotData(P2Data, i, 'P2', 'bid');
      this.saveSnapshotData(P3Data, i, 'P3', 'bid');
    });
    this.getOrderBookArrayByPrecision(precision, snap);
    // this.workers.postMessage('ask-group-precision', [snapshot, this.state, serialize({
    //   fns: {
    //     saveSnapshotData: this.saveSnapshotData,
    //   },
    //   utils: {
    //     roundPriceByPrecision: this.roundPriceByPrecision,
    //   },
    // }),]).then(data => {
    //   // this.state._constants.P0Data = data.P0Data;
    //   // this.state._constants.P0Data = data.P1Data;
    //   // this.state._constants.P0Data = data.P2Data;
    //   // this.state._constants.P0Data = data.P3Data;
    // }).catch((error) => { console.log(error); });

    // this.workers.postMessage('ask-group-precision', [snapshot, this.state, serialize({
    //   fns: {
    //     saveSnapshotData: this.saveSnapshotData,
    //   },
    //   utils: {
    //     roundPriceByPrecision: this.roundPriceByPrecision,
    //   },
    // }),]).then(data => {
    //   // this.state._constants.P0Data = data.P0Data;
    //   // this.state._constants.P0Data = data.P1Data;
    //   // this.state._constants.P0Data = data.P2Data;
    //   // this.state._constants.P0Data = data.P3Data;
    // }).catch((error) => { console.log(error); });

    // this.workers.postMessage('order-book-array-precision', [this.state, serialize({
    //   fns: {
    //     getPrecisionDataObjectFromPrecision: this.getPrecisionDataObjectFromPrecision,
    //   },
    //   utils: {},
    // }),]).then(data => {
    //   if (snap) {
    //     this.ExchangeDataEventBus.$emit('snapshotOrderbook', JSON.parse(JSON.stringify(data)));
    //   } else {
    //     this.ExchangeDataEventBus.$emit('updateOrderbook', JSON.parse(JSON.stringify(data)));
    //   }
    // }).catch((error) => { console.log(error); });
    // this.processOrderBookArrayByPrecision(this.state._constants.precision, snap);
  }

  processBarData(data) {
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

  updateBars(data) {
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
      this.ExchangeDataEventBus.$emit('updateCandles', bar);
    }
  }

  processMessage(incoming) {
    const {
      _constants,
    } = this.state;
    let barArray;
    let method = incoming.method;
    let params = incoming.params;
    if (params) {
      let incomingPair = reverseKeyMaps['bequant-_-' + params.symbol];
      if (_constants.selectedPair != incomingPair) {
        this.unsubscribeOrphaned();
        this.unsubscribePair(incomingPair);
        return;
      }
    }
    let dataArray = [];
    if (incoming.id) {
      delete this.state.unsubscribeObject[incoming.id];
    }
    switch (method) {
      case 'snapshotTrades':
      {
        dataArray = params.data;
        this.emitLiveTrades(dataArray, true);
        break;
      }
      case 'updateTrades':
      {
        dataArray = params.data;
        this.emitLiveTrades(dataArray, false);
        break;
      }
      case 'ticker':
        this.makeTickerResponse(params);
        break;
      case 'snapshotOrderbook':
      {
        this.resetData();
        this.updatePrecisionGrouping(params);
        this.groupSnapshotByPrecision(params, true);
        break;
      }
      case 'updateOrderbook':
      {
        this.groupSnapshotByPrecision(params, false);
        break;
      }
      case 'snapshotCandles':
      {
        dataArray = params.data;
        this.workers.postMessage('process-bar-data', [params.data, ]).then(data => {
          barArray = data;
          this.ExchangeDataEventBus.$emit('snapshotCandles', barArray);
        }).catch(() => {});
        break;
      }
      case 'updateCandles':
      {
        dataArray = params.data;
        this.updateBars(dataArray);
        break;
      }
      case 'default':
        break;
    }
  }

  changePrecision(key) {
    if (!this.state.connectionFlag) {
      return;
    }
    let keys = ['P0', 'P1', 'P2', 'P3', ];
    let index = keys.indexOf(this.state._constants.precision);
    if (key == 'minus') {
      if (index != 0) {
        this.state._constants.precision = keys[index - 1];
        this.getOrderBookArrayByPrecision(this.state._constants.precision, false);
      }
    } else {
      if (index != 3) {
        this.state._constants.precision = keys[index + 1];
        this.getOrderBookArrayByPrecision(this.state._constants.precision, false);
      }
    }
  }

  subscribeCandleEvent(info) {
    let symbol = info.symbol.name;
    let period = info.period;

    if (!this.state.connectionFlag) {
      return;
    }
    let pair = keyMaps['bequant-_-' + symbol];
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
    this.subscribeCandles(pair, xperiod);
  }

  unsubscribeCandleEvent() {
    if (!this.state.connectionFlag) {
      return;
    }
    this.unSubscribeCandles(this.state._constants.candlePair, this.state._constants.candlePeriod);
  }

  getDataBySymbol(symbol) {
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

  resolveSymbolFn(symbol) {
    const {
      _constants,
    } = this.state;
    if (!this.state.connectionFlag) {
      return;
    }
    switch (symbol) {
      case 'BTC':
        this.ExchangeDataEventBus.$emit('candle-symbol-resolved', _constants.btcdata);
        break;
      case 'ETH':
        this.ExchangeDataEventBus.$emit('candle-symbol-resolved', _constants.ethdata);
        break;
      case 'NEO':
        this.ExchangeDataEventBus.$emit('candle-symbol-resolved', _constants.neodata);
        break;
      default:
        this.ExchangeDataEventBus.$emit('candle-symbol-resolved', this.getDataBySymbol(symbol));
    }
    return;
  }

  initListeners() {
    this.ExchangeDataEventBus.$on('exchange-connect', () => this.connect());
    this.ExchangeDataEventBus.$on('precision', (key) => this.changePrecision(key));
    this.ExchangeDataEventBus.$on('change-symbol', (pair) => {
      this.changeTickerPair(pair);
      this.changePair(pair);
    });
    this.ExchangeDataEventBus.$on('subscribe-exchange', (exchange) => {
      let pair = keyMaps['bequant-_-' + this.state._constants.selectedPair];
      if (exchange == 'bequant') {
        this.subscribePair(pair);
        this.state.connectionFlag = true;
      } else {
        if (this.state.connectionFlag) {
          this.state.connectionFlag = false;
          this.unsubscribePair(this.state._constants.selectedPair);
        }
      }
    });
    this.ExchangeDataEventBus.$on('subscribe-all-ticker', () => {

      let pair = keyMaps['bequant-_-' + this.state._constants.selectedPair];
      let timerId;
      const self = this;
      const {
        ctx,
      } = this;
      const handler = () => {
        if (WebSocket.OPEN == ctx.readyState) {

          self.subscribeTicker(pair);
          clearInterval(timerId);
        }
      };
      timerId = setInterval(handler, 500);
    });
    this.ExchangeDataEventBus.$on('unsubscribe-all-ticker', () => {
      let pair = keyMaps['bequant-_-' + this.state._constants.selectedPair];
      this.unSubscribeTicker(pair);
    });
    this.ExchangeDataEventBus.$on('subscribe-candles', (info) => this.subscribeCandleEvent(info));
    this.ExchangeDataEventBus.$on('unsubscribe-candles', () => this.unsubscribeCandleEvent());
    this.ExchangeDataEventBus.$on('resolve-candle-symbol', (symbol) => this.resolveSymbolFn(symbol));
  }
}

const _bequant = new bequant();

export default _bequant;
