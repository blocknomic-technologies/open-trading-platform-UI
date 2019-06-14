import store from '@/store';
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
// import Decimal from 'decimal.js';
import Worker from 'simple-web-worker';
import serialize from 'serialize-javascript';
import keyMaps from '@/assets/json/keyMaps.js';
import precisionMaps from '@/assets/json/precisionMaps.js';
import binanceService from '@/services/binanceService.js';
import {
  dateToDisplayTime,
  depthReducer,
  sortData,
  roundANumber,
} from '@/utils/utility';

/**
 * Build Streams sockets that is to be connected
 * @param {*} [arr=[]]: Array of streams
 * @param {*} asset: Selected asset
 * @param {*} klineIntervals
 * @returns String of streams url
 */
function buildStreams(arr = [], asset, klineIntervals, ) {
  let streams = arr;
  const klineIndex = arr.findIndex((elem) => elem.stream === 'kline');
  if (klineIndex !== -1) {
    streams[klineIndex].stream = `kline_${klineIntervals[arr[klineIndex].options.interval]}`;
  }
  return streams.map(el => `${asset.toLowerCase()}@${el.stream}`).join('/');
}

/**
 * @class Binance
 */
class Binance {
  /**
   * Creates an instance of Binance.
   * @memberof Binance
   * Properties (ctx, _constants, orders)
   * _constants: {baseAddress, streams, klineIntervals, selectedPair [from store]}
   * ctx: Binance Context
   * orders: {asks, bids} [TODO: check for vuex/event performance]
   */
  constructor() {
    this.ExchangeDataEventBus = ExchangeDataEventBus;
    this.state = {
      _constants: {
        selectedExchange: store.getters.selectedExchange,
        precisionNumber: 1,
        precisionMaps: precisionMaps,
        // selectedExchange: 'binance',
        baseAddress: 'wss://stream.binance.com:9443/stream?streams=',
        streams: ['trade', 'ticker', 'depth', 'kline', ],
        klineIntervals: {
          '1': '1m',
          '5': '5m',
          '15': '15m',
          '30': '30m',
          '60': '1h',
          '1440': '1d',
          '1D': '1d',
          '1W': '1w',
          '1M': '1M',
        },
        // selectedPair: keyMaps['binance-_-' + store.getters.selectedPair],
        selectedPair: 'btcusdt',
        defaultPair: 'btcusdt',
        precision: 1,
        period: '1',
        ethdata: {
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
          supported_resolutions: ['1', '5', '15', '30', '60', '1440', ],
          pricescale: 100,
          ticker: 'ETH',
          base_name: ['ETH', ],
          legs: ['BTC', ],
          exchange: 'binance',
          full_name: 'binance',
          pro_name: 'ETH',
          data_status: 'streaming',
        },
        btcdata: {
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
          supported_resolutions: ['1', '5', '15', '30', '60', '1440', ],
          pricescale: 100,
          ticker: 'BTC',
          base_name: ['BTC', ],
          legs: ['BTC', ],
          exchange: 'binance',
          full_name: 'binance',
          pro_name: 'BTC',
          data_status: 'streaming',
        },
        neodata: {
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
          supported_resolutions: ['1', '5', '15', '30', '60', '1440', ],
          pricescale: 100,
          ticker: 'NEO',
          base_name: ['NEO', ],
          legs: ['NEO', ],
          exchange: 'binance',
          full_name: 'binance',
          pro_name: 'NEO',
          data_status: 'streaming',
        },
      },
      snapshotFlag: false,
      connectionFlag: false,
      orders: {
        asks: {},
        bids: {},
      },
    };
    this.actions = [{
      message: 'socket-trade',
      func: this.processSocketTrade,
    }, {
      message: 'snapshot-trade',
      func: this.processSnapshotTrade,
    }, {
      message: 'ticker',
      func: this.processTicker,
    }, {
      message: 'snapshot-depth',
      func: this.processSnapshotDepth,
    }, {
      message: 'socket-depth',
      func: this.processSocketDepth,
    }, {
      message: 'emit-precision-data',
      func: this.emitPrecisionData,
    }, {
      message: 'snapshot-kline',
      func: this.processSnapshotKline,
    }, ];
    this.ctx = {
      close() {},
    };
    this.workers = Worker.create(this.actions);
    // this.getSnapshots();
    this.initListeners();
  }

  /**
   * Process stream of trade
   * 
   * @param {*} data
   * @param {*} obj
   * @returns
   * @memberof Binance
   */
  processSocketTrade(data, obj) {
    const E = eval('(' + obj + ')');
    const D = E.utils.dateToDisplayTime(new Date(data.T));
    const T = E.fns.handleTradeUpdate(data, D);
    return T;
  }

  /**
   * Process snapshot (api call) of trade
   *
   * @memberof Binance
   */
  processSnapshotTrade() {}

  /**
   * Process Snapshot of kline
   *
   * @memberof Binance
   */
  processSnapshotKline(data) {
    let packet = data.map(element => {
      return {
        time: Number(element[0]),
        open: Number(element[1]),
        high: Number(element[2]),
        low: Number(element[3]),
        close: Number(element[4]),
        volume: Number(element[5]),
      };
    });
    return {
      meta: {
        noData: true,
      },
      bars: packet,
    };
  }

  /**
   * Process stream of Kline
   *
   * @param {*} data
   * @returns
   * @memberof Binance
   */
  processSocketKline(data) {
    let klineBar = {
      time: Number(data.T),
      open: Number(data.o),
      high: Number(data.h),
      low: Number(data.l),
      close: Number(data.c),
      volume: Number(data.v),
    };
    return klineBar;
  }

  /**
   * Process stream of depth
   *
   * @param {*} data
   * @param {*} state
   * @param {*} obj
   * @returns
   * @memberof Binance
   */
  processSocketDepth(data, state, obj) {
    const E = eval('(' + obj + ')');
    const {
      orders,
    } = state;
    if (data.a.length) {
      orders.asks = E.utils.depthReducer(data.a, orders.asks);
    }
    if (data.b.length) {
      orders.bids = E.utils.depthReducer(data.b, orders.bids);
    }
    // state.snapshotFlag = false;
    // let precisionAsksObj = Object.keys(orders.asks).reduce((previous, current) => E.fns.precisionObjectCreater(previous, current, state, orders, 'asks', E.utils.roundANumber), {});
    // let precisionBidsObj = Object.keys(orders.bids).reduce((previous, current) => E.fns.precisionObjectCreater(previous, current, state, orders, 'bids', E.utils.roundANumber), {});
    // let asks = E.utils.sortData(Object.values(precisionAsksObj));
    // let bids = E.utils.sortData(Object.values(precisionBidsObj));
    // return { asks, bids, snapshotFlag: false, };
    return {
      asks: orders.asks,
      bids: orders.bids,
    };
  }

  /**
   * Process snapshot(api call) depth
   *
   * @param {*} data
   * @param {*} state
   * @param {*} obj
   * @returns
   * @memberof Binance
   */
  processSnapshotDepth(data, state, obj) {
    const E = eval('(' + obj + ')');
    state.orders.asks = E.utils.depthReducer(data.asks, state.orders.asks);
    state.orders.bids = E.utils.depthReducer(data.bids, state.orders.bids);
    return {
      asks: state.orders.asks,
      bids: state.orders.bids,
    };
  }

  /**
   * Process ticker stream
   *
   * @param {*} data
   * @param {*} state
   * @returns
   * @memberof Binance
   */
  processTicker(data, state) {
    return {
      exchange: 'binance',
      ask: Number(data.a),
      bid: Number(data.b),
      high: Number(data.h),
      last: Number(data.c),
      low: Number(data.l),
      percentage: Number(data.P).toFixed(4),
      symbol: state._constants.selectedPair,
      volume: Number(data.v).toFixed(2),
    };
  }

  // for trade
  handleTradeUpdate(data, timeStamp) {
    return {
      buyOrSell: data.m ? 'sell' : 'buy',
      price: Number(data.p),
      timeStamp,
      volume: Number(data.q),
    };
  }

  // For depth trade
  precisionObjectCreater(previous, current, state, orders, type, roundANumber) {
    const {
      _constants,
    } = state;
    let roundedCurrent = roundANumber(current, _constants.precision);
    let roundedValue = roundedCurrent;
    if (_constants.precision.toString().includes('.')) {
      roundedCurrent = roundedCurrent.toFixed(parseInt(_constants.precision.toString().split('.')[1].length));
      roundedValue = roundedValue.toFixed(parseInt(_constants.precision.toString().split('.')[1].length));
    }
    if (!previous[roundedCurrent]) {
      previous[roundedCurrent] = {
        value: roundedValue,
        volume: 0,
      };
    }
    previous[roundedCurrent].volume += type === 'asks' ? orders.asks[current].volume : orders.bids[current].volume;
    return previous;
  }

  // for kline
  getKlinePeriod() {
    return this.state._constants.period;
  }

  // Listeners
  handleChangeSymbol(symbol) {
    this.ctx.close();
    this.state._constants.selectedPair = (keyMaps[`binance-_-${symbol}`] || '').toLowerCase();
    this.state._constants.selectedExchange = store.getters.selectedExchange.toLowerCase();
    this.generalConnectToExchange(this.state._constants.selectedExchange);
  }

  handleChangeExchange(ex) {
    this.state._constants.selectedExchange = ex;
    if (ex !== 'binance') {
      this.ctx.close();
      this.state.connectionFlag = false;
      this.connect(this.state._constants.selectedPair, [{
        stream: 'ticker',
      }, ]);
    } else {
      this.state.connectionFlag = true;
      this.generalConnectToExchange(ex);
    }
  }

  async askKlineData(inputPacket) {
    const {
      _constants,
    } = this.state;
    if (_constants.selectedExchange === 'binance') {
      this.state._constants.period = _constants.klineIntervals[inputPacket.period];
      let response = await binanceService.binanceKlineData({
        pair: _constants.selectedPair,
        interval: _constants.period,
      });
      this.sendSnapshot(response.data);
      this.workers.postMessage('snapshot-kline', [response.data, ]).then(data => {
        if (this.state.connectionFlag) {
          this.ExchangeDataEventBus.$emit('snapshotCandles', data);
          this.ctx.close();
          this.connect(_constants.selectedPair, [{
            stream: 'ticker',
          }, {
            stream: 'trade',
          }, {
            stream: 'depth',
          }, {
            stream: 'kline',
            options: {
              interval: inputPacket.period,
            },
          }, ]);
        }
      }).catch(() => {});
    }
  }

  resolveSymbolFn(symbol) {
    const {
      _constants,
      connectionFlag,
    } = this.state;
    if (!connectionFlag) {
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
        this.ExchangeDataEventBus.$emit('candle-symbol-resolved', this.symbolData(symbol));
    }
    return;
  }

  symbolData(symbol) {
    let pair = symbol.split('/')[0];
    return {
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
      supported_resolutions: ['1', '5', '15', '30', '60', '1440', ],
      pricescale: 100,
      ticker: pair,
      base_name: [pair, ],
      legs: [pair, ],
      exchange: 'binance',
      full_name: 'binance',
      pro_name: pair,
      data_status: 'streaming',
    };
  }

  sendSnapshot() {}

  generalConnectToExchange(ex) {
    const {
      _constants,
    } = this.state;
    this.state._constants.selectedExchange = ex;
    if (_constants.selectedExchange === 'binance') {
      this.state.connectionFlag = true;
      this.getSnapshots();
    } else {
      this.state.connectionFlag = false;
      this.ctx.close();
      this.connect(_constants.selectedPair, [{
        stream: 'ticker',
      }, ]);
    }
  }

  emitPrecisionData(state, obj) {
    const E = eval('(' + obj + ')');
    const {
      orders,
    } = state;
    let precisionAsksObj = Object.keys(orders.asks).reduce((previous, current) => E.fns.precisionObjectCreater(previous, current, state, orders, 'asks', E.utils.roundANumber), {});
    let precisionBidsObj = Object.keys(orders.bids).reduce((previous, current) => E.fns.precisionObjectCreater(previous, current, state, orders, 'bids', E.utils.roundANumber), {});

    let asks = E.utils.sortData(Object.values(precisionAsksObj));
    let bids = E.utils.sortData(Object.values(precisionBidsObj));
    return {
      asks,
      bids,
    };
  }

  initListeners() {
    const self = this;
    this.ExchangeDataEventBus.$on('change-symbol', (symbol) => this.handleChangeSymbol(symbol));
    this.ExchangeDataEventBus.$on('binance-unsubscribe', () => self.ctx.close());
    this.ExchangeDataEventBus.$on('subscribe-exchange', (ex) => {
      this.handleChangeExchange(ex);
    });
    this.ExchangeDataEventBus.$on('subscribe-candles', (inputPacket) => this.askKlineData(inputPacket));
    this.ExchangeDataEventBus.$on('resolve-candle-symbol', (symbol) => this.resolveSymbolFn(symbol));
    this.ExchangeDataEventBus.$on('change-precision', ({
      precisionPass,
      precisionNumber,
    }) => {
      this.state._constants.precision = precisionPass;
      this.state._constants.precisionNumber = precisionNumber;
      if (!this.state.connectionFlag) {
        return;
      }
      this.workers.postMessage('emit-precision-data', [this.state, serialize({
        fns: {
          precisionObjectCreater: this.precisionObjectCreater,
        },
        utils: {
          depthReducer,
          sortData,
          roundANumber,
        },
      }), ]).then(data => {
        if (this.state.connectionFlag) {
          return;
        }
        if (this.state.snapshotFlag) {
          this.ExchangeDataEventBus.$emit('snapshotOrderbook', {
            asks: data.asks,
            bids: data.bids,
          });
        } else {
          this.ExchangeDataEventBus.$emit('updateOrderbook', {
            asks: data.asks,
            bids: data.bids,
          });
        }
      }).catch((() => {}));
    });
  }

  /**
   * Connects to Binance Streams, defaults to connect all streams.
   * e.g: streamsToConnect = [{
   *   stream: 'ticker',
   * }, {
   *  stream: 'kline',
   *  options: { interval: '1', },
   * }, {
   *  stream: 'depth',
   * }, {
   *   stream: 'trade',
   * },];
   * @param {*} [asset=this._constants.selectedPair]
   * @param {*} streamsToConnect
   * @memberof Binance
   */
  connect(asset = this.state._constants.selectedPair, streamsToConnect) {
    const {
      baseAddress,
      streams,
      klineIntervals,
    } = this.state._constants;
    let builtStreams = '';
    if (streamsToConnect.length > 0) {
      builtStreams = buildStreams(streamsToConnect, asset, klineIntervals);
    } else {
      builtStreams = buildStreams(streams, asset, klineIntervals);
    }
    let address = `${baseAddress}${builtStreams}`;
    let binance = new WebSocket(address);
    binance.onopen = this.handleOpen;
    binance.onmessage = (message) => this.handleMessage(message);
    binance.onclose = this.handleClose;
    this.ctx.close();
    this.ctx = binance;
  }

  async getSnapshots() {
    if (!this.state.connectionFlag) {
      return;
    }

    this.state._constants.precision = precisionMaps[`${this.state._constants.selectedExchange}-_-${store.getters.selectedPair}`];
    this.state.orders.asks = {};
    this.state.orders.bids = {};
    const {
      selectedPair,
    } = this.state._constants;
    let response = await binanceService.binanceData({
      pair: this.state._constants.selectedPair.toLowerCase(),
    });
    let resData = response.data;
    let tradesSnapshot = resData.trades.map((element) => {
      return {
        buyOrSell: element.isBuyerMaker ? 'sell' : 'buy',
        price: Number(element.price),
        timeStamp: dateToDisplayTime(new Date(element.time)),
        volume: Number(element.qty),
      };
    });
    this.ExchangeDataEventBus.$emit('snapshotTrades', tradesSnapshot);
    let resDepth = resData.depth;
    this.workers.postMessage('snapshot-depth', [resDepth, this.state, serialize({
      fns: {},
      utils: {
        depthReducer,
      },
    }), ]).then(data => {
      this.state.orders.asks = data.asks;
      this.state.orders.bids = data.bids;
      this.state.snapshotFlag = true;
      this.workers.postMessage('emit-precision-data', [this.state, serialize({
        fns: {
          precisionObjectCreater: this.precisionObjectCreater,
        },
        utils: {
          sortData,
          roundANumber,
        },
      }), ]).then(data => {
        if (this.state.snapshotFlag) {
          this.ExchangeDataEventBus.$emit('snapshotOrderbook', {
            asks: data.asks,
            bids: data.bids,
          });
        } else {
          this.ExchangeDataEventBus.$emit('updateOrderbook', {
            asks: data.asks,
            bids: data.bids,
          });
        }
      }).catch(() => {});
      this.connect(selectedPair, streams);
    }).catch(() => {});
  }

  /**
   * Handle Open Listener for Binance Socket
   * @memberof Binance
   */
  handleOpen() {}

  /**
   * Handle Message stream for connected socket streams
   * @param {*} message
   * @memberof Binance
   */
  handleMessage(message) {
    let {
      data,
      stream,
    } = JSON.parse(message.data);
    const {
      selectedPair,
    } = this.state._constants;
    switch (stream) {
      case `${selectedPair}@ticker`:
      {
        if (store.getters.selectedExchange === 'binance') {
          store.state.sellPrice = data.b;
          store.state.buyPrice = data.a;
        }
        this.workers.postMessage('ticker', [data, this.state, ]).then((data) => {
          this.ExchangeDataEventBus.$emit('ticker', data);
        }).catch(() => {});
        break;
      }
      case `${selectedPair}@trade`:
      {

        this.workers.postMessage('socket-trade', [data, serialize({
          fns: {
            handleTradeUpdate: this.handleTradeUpdate,
          },
          utils: {
            dateToDisplayTime,
          },
        }), ]).then((data) => {

          this.ExchangeDataEventBus.$emit('liveTrades', data);
        }).catch(() => {});
        break;
      }
      case `${selectedPair}@depth`:
      {
        if (this.state.connectionFlag) {
          const state = this.state;
          this.workers.postMessage('socket-depth', [data, state, serialize({
            fns: {
              precisionObjectCreater: this.precisionObjectCreater,
            },
            utils: {
              depthReducer,
              sortData,
              roundANumber,
            },
          }), ]).then(data => {
            this.state.orders.asks = data.asks;
            this.state.orders.bids = data.bids;
            this.state.snapshotFlag = false;
            this.workers.postMessage('emit-precision-data', [this.state, serialize({
              fns: {
                precisionObjectCreater: this.precisionObjectCreater,
              },
              utils: {
                sortData,
                roundANumber,
              },
            }), ]).then(data => {
              if (this.state.snapshotFlag) {
                this.ExchangeDataEventBus.$emit('snapshotOrderbook', {
                  asks: data.asks,
                  bids: data.bids,
                });
              } else {
                this.ExchangeDataEventBus.$emit('updateOrderbook', {
                  asks: data.asks,
                  bids: data.bids,
                });
              }
            }).catch(() => {});
          }).catch(() => {});
        }
        break;
      }
      case `${selectedPair}@kline_${this.getKlinePeriod()}`:
      {
        if (this.state.connectionFlag) {
          const klineBar = this.processSocketKline(data.k);
          this.ExchangeDataEventBus.$emit('updateCandles', klineBar);
        }
        break;
      }
      case 'default':
        break;
    }
  }

  /**
   * Closes the connection of the socket
   * @memberof Binance
   */
  close() {
    this.ctx.close();
  }
}

const _Binance = new Binance();

const streams = [{
  stream: 'ticker',
}, {
  stream: 'trade',
}, {
  stream: 'depth',
}, {
  stream: 'kline',
  options: {
    interval: '1',
  },
}, ];

// _Binance.connect('btcusdt', streams);

export default _Binance;
