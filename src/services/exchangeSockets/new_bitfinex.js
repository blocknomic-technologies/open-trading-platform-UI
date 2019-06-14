import store from '@/store';
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import Worker from 'simple-web-worker';
import serialize from 'serialize-javascript';
import keyMaps from '@/assets/json/keyMaps.js';
import {
  dateToDisplayTime,
} from '@/utils/utility';

class Bitfinex {
  constructor() {
    this.ExchangeDataEventBus = ExchangeDataEventBus;
    this.state = {
      _constants: {
        selectedExchange: store.getters.selectedExchange,
        // selectedPair: store.getters.selectedPair,
        defaultPair: 'BTC/USD',
        selectedPair: 'BTC/USD',
        baseAddress: 'wss://api.bitfinex.com/ws/2',
        streams: ['trades', 'candles', 'books', 'ticker', ],
        channelIDs: {
          candles: '',
          trades: '',
          books: '',
          ticker: '',
        },
        candlesIdArray: [],
        precision: 'P1',
        ethdata: {
          name: 'ETH/USD',
          'exchange-traded': 'bitfinex',
          'exchange-listed': 'bitfinex',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          minmov: 1,
          minmov2: 0,
          pointvalue: 1,
          session: '24x7',
          // has_seconds: true,
          has_intraday: true,
          // intraday_multipliers: ['1', '60',],
          // has_weekly_and_monthly: true,
          // volume_precision: 8,
          description: 'Etherium on bitfinex',
          type: 'bitcoin',
          supported_resolutions: ['1', '5', '15', '30', '60', '1440', ],
          // supported_resolutions: ['1', '5', '15', '30', '60',],
          pricescale: 100,
          ticker: 'ETH',
          base_name: ['ETH', ],
          legs: ['BTC', ],
          exchange: 'bitfinex',
          full_name: 'bitfinex',
          pro_name: 'ETH',
          data_status: 'streaming',
        },
        btcdata: {
          name: 'BTC/USD',
          'exchange-traded': 'bitfinex',
          'exchange-listed': 'bitfinex',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          minmov: 1,
          minmov2: 0,
          pointvalue: 1,
          session: '24x7',
          // has_seconds: true,
          has_intraday: true,
          // intraday_multipliers: ['1', '60',],
          // has_weekly_and_monthly: true,
          // volume_precision: 8,
          description: 'bitfinex bitcoin prices',
          type: 'bitcoin',
          supported_resolutions: ['1', '5', '15', '30', '60', '1440', ],
          // supported_resolutions: ['1', '5', '15', '30', '60',],
          pricescale: 100,
          ticker: 'BTC',
          base_name: ['BTC', ],
          legs: ['BTC', ],
          exchange: 'bitfinex',
          full_name: 'bitfinex',
          pro_name: 'BTC',
          data_status: 'streaming',
        },
        neodata: {
          name: 'NEO/USD',
          'exchange-traded': 'bitfinex',
          'exchange-listed': 'bitfinex',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          minmov: 1,
          minmov2: 0,
          pointvalue: 1,
          session: '24x7',
          // has_seconds: true,
          has_intraday: true,
          // intraday_multipliers: ['1', '60',],
          // has_weekly_and_monthly: true,
          // volume_precision: 8,
          description: 'NEO on bitfinex',
          type: 'bitcoin',
          supported_resolutions: ['1', '5', '15', '30', '60', '1440', ],
          // supported_resolutions: ['1', '5', '15', '30', '60',],
          pricescale: 100,
          ticker: 'NEO',
          base_name: ['NEO', ],
          legs: ['NEO', ],
          exchange: 'bitfinex',
          full_name: 'bitfinex',
          pro_name: 'NEO',
          data_status: 'streaming',
        },
      },
      chartData: {},
      connectionFlag: false,
      prevTime: 0,
      get previousTime() {
        return this.prevTime || (Date.now() - 1000);
      },
      set previousTime(value) {
        this.prevTime = value;
      },
    };
    this.actions = [{
      message: 'emit-live-trades',
      func: this.emitLiveTrades,
    }, ];
    this.ctx = {
      close() {},
      readyState: 3,
    };
    this.workers = Worker.create(this.actions);
    this.initListeners();
    this.connectNew();
  }

  subscribePair(currencyPair) {
    let pair = keyMaps[`bitfinex-_-${currencyPair}`];
    this.subscribeOrderBook(pair);
    this.subscribeTicker(pair, 'P0');
    this.subscribeTrades(pair);
    //subscribeCandles(pair, '1m');
  }

  subscribeOrderBook(pair) {
    const {
      precision,
    } = this.state._constants;
    let symbol = pair;
    let data = {
      event: 'subscribe',
      channel: 'book',
      symbol,
      prec: precision,
      //len: '20',
    };
    this.ctx.send(JSON.stringify(data));
  }

  subscribeTrades(pair) {
    let symbol = pair;
    let data = {
      event: 'subscribe',
      channel: 'trades',
      symbol,
    };
    this.ctx.send(JSON.stringify(data));
  }

  subscribeCandles(pair, timeFrame) {
    let key = `trade:${timeFrame}:${pair}`;
    let data = {
      event: 'subscribe',
      channel: 'candles',
      key,
    };
    this.ctx.send(JSON.stringify(data));
  }

  unsubscribe(key) {
    const {
      channelIDs,
      candlesIdArray,
    } = this.state._constants;
    if (!key) {
      [channelIDs.trades, channelIDs.books, ...candlesIdArray, ].forEach((elem) => {
        let data = {
          'event': 'unsubscribe',
          'chanId': elem,
        };
        this.ctx.send(JSON.stringify(data));
      });
    } else {
      let data = {
        'event': 'unsubscribe',
        'chanId': key,
      };
      this.ctx.send(JSON.stringify(data));
    }
  }

  emitLiveTrades(data, obj) {
    const E = eval('(' + obj + ')');
    let arr = data.map((elem) => {
      let obj = {};
      obj.price = Number((elem[3]));
      obj.timeStamp = E.utils.dateToDisplayTime(new Date(elem[1]));
      obj.volume = Math.abs(elem[2]);
      obj.buyOrSell = elem[2] < 0 ? 'sell' : 'buy';
      return obj;
    });
    return arr;
  }

  emitWorkerTrades(data, isSnapShot) {
    if (isSnapShot) {
      this.workers.postMessage('emit-live-trades', [data, serialize({
        fns: {},
        utils: {
          dateToDisplayTime,
        },
      }), ]).then(data => {
        this.ExchangeDataEventBus.$emit('snapshotTrades', data);
        this.ExchangeDataEventBus.$emit('liveTrades', data[1]);
      }).catch(() => {});
    } else {
      let arr = [];
      let obj = {};
      obj.price = Number((data[3]).toFixed(2));
      obj.timeStamp = dateToDisplayTime(new Date(data[1]));
      obj.volume = Math.abs(data[2]);
      obj.buyOrSell = data[2] < 0 ? 'sell' : 'buy';
      arr.push(obj);
      this.ExchangeDataEventBus.$emit('liveTrades', obj);
    }
  }

  emitBooks(data) {
    const {
      chartData,
    } = this.state;
    if (data != 'hb') {
      if (Array.isArray(data[0])) {
        let asks = [];
        let bids = [];
        data.forEach((item) => {
          if (item[2] > 0) {
            let localData = {};
            localData.value = item[0];
            localData.volume = Number(Math.abs(item[2]));
            bids.push(localData);
          } else {
            let localData = {};
            localData.value = item[0];
            localData.volume = Number(Math.abs(item[2]));
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
        this.ExchangeDataEventBus.$emit('snapshotOrderbook', JSON.parse(JSON.stringify(chartData)));

      } else {
        if (chartData.asks && chartData.bids) {
          if (data[2] > 0) {
            let flag = 0;
            chartData.bids.forEach(function (elem, index) {
              if (elem.value == data[0]) {
                if (data[1] == 0 && data[2] == 1) {
                  chartData.bids.splice(index, 1);
                } else {
                  chartData.bids[index].volume = Number(data[2]);
                }
                flag = 1;
              }
              if (index == (chartData.bids.length - 1) && (flag == 0)) {
                if (data[2] != 1) {
                  let localData = {};
                  localData.value = data[0];
                  localData.volume = Number(data[2]);
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
                  chartData.asks[index].volume = Number(Math.abs(data[2]));
                }
                flag = 1;
              }
              if (index == (chartData.asks.length - 1) && (flag == 0)) {
                if (data[2] != -1) {
                  let localData = {};
                  localData.value = data[0];
                  localData.volume = Number(Math.abs(data[2]));
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
            this.ExchangeDataEventBus.$emit('updateOrderbook', JSON.parse(JSON.stringify(chartData)));
          } else {
            this.refreshOrderBook();
          }
        }
      }
    }
  }

  refreshOrderBook() {
    this.unsubscribe(this.state._constants.channelIDs.books);
    let pair = this.state._constants.selectedPair.replace('/', '');
    this.subscribeOrderBook(pair, this.state._constants.precision);
  }

  updateBars(data) {
    let elem = data;
    let {
      prevTime,
    } = this.state;
    let bar = {
      time: elem[0],
      close: Number(elem[2]),
      open: Number(elem[1]),
      high: Number(elem[3]),
      low: Number(elem[4]),
      volume: Number(elem[5]),
    };
    if (Number(bar.time) >= Number(prevTime)) {
      this.ExchangeDataEventBus.$emit('updateCandles', bar);
      this.state.prevTime = Number(bar.time);
    }
  }

  makeTickerResponse(data) {
    let obj = {};
    let {
      selectedPair,
    } = this.state._constants;
    if (store.getters.selectedExchange === 'bitfinex') {
      store.state.sellPrice = data[0];
      store.state.buyPrice = data[2];
    }
    obj.ask = data[2];
    obj.bid = data[0];
    obj.high = data[8];
    obj.low = data[9];
    obj.last = data[6];
    obj.volume = (data[7]);
    obj.symbol = selectedPair;
    obj.percentage = (data[5] * 100);
    obj.exchange = 'bitfinex';
    this.ExchangeDataEventBus.$emit('ticker', obj);
  }

  connect() {

  }

  connectNew() {
    const {
      baseAddress,
    } = this.state._constants;
    const bitfinex = new WebSocket(baseAddress);
    bitfinex.onopen = () => this.handleOpen();
    bitfinex.onclose = this.handleClose;
    bitfinex.onerror = this.handleError;
    bitfinex.onmessage = (message) => this.handleMessage(message);
    this.ctx.close();
    this.ctx = bitfinex;
  }

  handleOpen() {
    this.ExchangeDataEventBus.$emit('exchange-connected', store.getters.selectedExchange);
  }

  handleClose() {}

  handleError() {}

  handleMessage(message) {
    let dataObj = JSON.parse(message.data);
    let event = dataObj.event;
    const {
      _constants,
    } = this.state;
    if (event) {
      switch (event) {
        case 'info':
        {
          if (dataObj.code) {
            if (dataObj.code == 20051) {
              this.ctx.close();
              this.subscribePair(_constants.selectedPair);
            }
          }
          break;
        }
        case 'subscribed':
        {
          if (dataObj.channel === 'trades') {
            _constants.channelIDs.trades = dataObj.chanId;
          } else if (dataObj.channel === 'candles') {
            _constants.channelIDs.candles = dataObj.chanId;
            _constants.candlesIdArray.push(dataObj.chanId);
          } else if (dataObj.channel === 'book') {
            _constants.channelIDs.books = dataObj.chanId;
          } else if (dataObj.channel === 'ticker') {
            _constants.channelIDs.ticker = dataObj.chanId;
          }
          break;
        }
        case 'default':
          break;
      }
    } else {
      let response = dataObj;
      if (response[0] == _constants.channelIDs.trades) {
        if (response[1] == 'tu') {
          this.emitWorkerTrades(response[2], false);
        } else if (Array.isArray(response[1])) {
          this.emitWorkerTrades(response[1], true);
        }
      } else if (response[0] == _constants.channelIDs.books) {
        let data = response[1];
        this.emitBooks(data);
      } else if (response[0] == _constants.channelIDs.candles) {
        if (response[1] != 'hb') {
          if (Array.isArray(response[1][0])) {
            let barArray = this.barData(response[1]);
            this.ExchangeDataEventBus.$emit('snapshotCandles', barArray);
          } else {
            this.updateBars(response[1]);
          }
        }

      } else if (response[0] == _constants.channelIDs.ticker) {
        if (response[1] != 'hb') {
          this.makeTickerResponse(response[1]);
        }
      }
    }
  }

  subscribeExchange(exchange) {
    let {
      _constants,
      connectionFlag,
    } = this.state;
    _constants.selectedExchange = exchange;
    this.state.chartData = {};
    if (exchange == 'bitfinex') {
      this.unsubscribe();
      this.subscribePair(_constants.selectedPair);
      this.state.connectionFlag = true;
    } else {
      if (connectionFlag) {
        this.unsubscribe();
        this.state.connectionFlag = false;
      }
    }
  }

  async subscribeAllTicker() {
    let pair = this.state._constants.selectedPair.replace('/', '');
    let timerId;
    const handler = () => {
      if (WebSocket.OPEN == this.ctx.readyState) {
        this.subscribeTicker(pair, 'P0');
        clearInterval(timerId);
      }
    };
    timerId = setInterval(handler, 500);
  }

  unsubscribeAllTicker() {
    this.unsubscribe(this.state._constants.channelIDs.ticker);
  }

  changePair(pair) {
    this.state._constants.precision = 'P2';
    this.state._constants.selectedPair = pair;
    if (!this.state.connectionFlag) {
      // console.log('bitfinex not active returning');
      return;
    }
    // let unPair = currentPair || defaultPair;
    //currentPair = pair;
    this.unsubscribe();
    this.subscribePair(pair);
  }

  changeSymbol(pair) {
    this.state.chartData = {};
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
    this.changeTickerPair(pair);
    this.changePair(pair);
  }

  changeTickerPair(pair) {
    this.unsubscribe(this.state._constants.channelIDs.ticker);
    let Cpair = pair.replace('/', '');
    this.subscribeTicker(Cpair, 'P0');
    return;
  }

  subscribeTicker(pair, precision) {
    let symbol = pair;
    let data = {
      event: 'subscribe',
      channel: 'ticker',
      symbol,
      precision,
    };
    this.ctx.send(JSON.stringify(data));
  }

  subscribeCandleEvent(info) {

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
    if (!this.state.connectionFlag) {
      return;
    }

    let pair = keyMaps[`bitfinex-_-${symbol}`];

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
      case '1440':
        xperiod = '1D';
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
    this.subscribeCandles(pair, xperiod);
  }

  unsubscribeCandleEvent() {
    if (!this.state.connectionFlag) {
      return;
    }
    this.unsubscribe(this.state._constants.channelIDs.candles);
  }

  getDataBySymbol(symbol) {
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
      // has_seconds: true,
      has_intraday: true,
      // intraday_multipliers: ['1', '60',],
      // has_weekly_and_monthly: true,
      // volume_precision: 8,
      description: pair + ' on bitfinex',
      type: 'bitcoin',
      supported_resolutions: ['1', '5', '15', '30', '60', '1440', ],
      // supported_resolutions: ['1', '5', '15', '30', '60',],
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

  symbolData() {
    if (!this.state.connectionFlag) {
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
    this.ExchangeDataEventBus.$emit('all-symbols', newArray);
  }

  barData(data) {
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

  changePrecision(keyObj) {
    const {
      _constants,
      connectionFlag,
    } = this.state;
    let {
      key,
    } = keyObj;
    if (!connectionFlag) {
      return;
    }
    this.unsubscribe(_constants.channelIDs.books);
    let keys = ['P0', 'P1', 'P2', 'P3', ];
    let index = keys.indexOf(_constants.precision);
    if (key == 'minus') {
      if (index != 0) {
        _constants.precision = keys[index - 1];
      }
    } else {
      if (index != 3) {
        _constants.precision = keys[index + 1];
      }
    }
    let pair = _constants.selectedPair.replace('/', '');
    this.subscribeOrderBook(pair, _constants.precision);
  }

  initListeners() {
    // this.ExchangeDataEventBus.$on('exchange-connect', () => this.connect());
    this.ExchangeDataEventBus.$on('precision', (keyObj) => this.changePrecision(keyObj));
    this.ExchangeDataEventBus.$on('subscribe-exchange', (ex) => this.subscribeExchange(ex));
    this.ExchangeDataEventBus.$on('subscribe-all-ticker', () => this.subscribeAllTicker());
    this.ExchangeDataEventBus.$on('unsubscribe-all-ticker', () => this.unsubscribeAllTicker());
    this.ExchangeDataEventBus.$on('change-symbol', (pair) => this.changeSymbol(pair));
    this.ExchangeDataEventBus.$on('subscribe-candles', (info) => this.subscribeCandleEvent(info));
    this.ExchangeDataEventBus.$on('unsubscribe-candles', () => this.unsubscribeCandleEvent());
    this.ExchangeDataEventBus.$on('resolve-candle-symbol', (symbol) => this.resolveSymbolFn(symbol));
    this.ExchangeDataEventBus.$on('get-all-symbols', () => this.symbolData());
  }
}

const _Bitfinex = new Bitfinex();

// _Bitfinex.connect();

export default _Bitfinex;
