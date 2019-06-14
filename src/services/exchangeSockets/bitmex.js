import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import store from '@/store';
import TradeService from '@/services/TradeService';

class Bitmex {
    constructor() {
        this.ExchangeDataEventBus = ExchangeDataEventBus;
        this.baseUrl = 'wss://www.bitmex.com/realtime';
        this.websocket;
        this.arr = [];
        this.asks = [];
        this.bids = [];
        this.selectedExchange = '';
        this.selectedExchange = store.getters.selectedExchange;
        this.chartData = {};
        this.tickerObj = {};
        this.subscribedPair = '';
        this.connect();
        this.subscribed = false;
        this.subscribingBitmex();
        this.latestOrderBook;
        this.obInterval;
        this.isSnapshot = true;
        this.precision = 10;
        this.precisionNumber = {
            0: 0,
            1: 1,
            2: 10,
            3: 100,
        };
        this.precisionNumberlessZero = {
            0: 0,
            1: 0.001,
            2: 0.01,
            3: 0.1,
        };
        this.precisionNumberN = 1;
        this.bitmexWorker = new Worker("http://localhost:8080/bitmexWorker.js");
    }

    connect() {
        let self = this;
        this.websocket = new WebSocket(this.baseUrl);
        this.websocket.onmessage = msg => self.handleMessage(self, msg);
        this.websocket.onclose = () => self.handleClose(self);
        this.websocket.onerror = () => self.handleError(self);
        // this.websocket.onopen = (open) => self.handleOpen(self, open);
    }

    handleMessage(self, msg) {
        let data = JSON.parse(msg.data);
        if (msg.isTrusted) {
            if (data.table === 'orderBookL2_25') {
                this.handleOrderBook(self, data);
            } else if (data.table === 'trade') {
                this.handleTrades(self, data);
            } else if (data.table === 'instrument') {
                this.handleInstrument(self, data);
            }
        }
    }

    handleClose(self) {
        clearInterval(this.obInterval);
        self.connect();
    }

    handleError(self) {
        clearInterval(this.obInterval);
        self.connect();
    }

    subscribeAll(pair) {
        if (store.getters.selectedExchange === 'bitmex') {
            if (this.subscribed === true) {
                this.subscribed = false;
                this.unsubscribeAll(this.subscribedPair);
            }
            this.subscribed = true;
            this.subscribedPair = pair;
            this.websocket.send(
                JSON.stringify({
                    op: 'subscribe',
                    args: [
                        `orderBookL2_25:${pair}`,
                        `trade:${pair}`,
                        `instrument:${pair}`,
                    ],
                })
            );
            this.snapshotTrades(pair);
            this.startEmitingObData();
        } else {
            if (this.subscribed === true) {
                this.subscribed = false;
                clearInterval(this.obInterval);
                this.unsubscribeAll(this.subscribedPair);
            }
        }
    }

    async snapshotTrades(pair) {
        let response = await TradeService.bitmexGetTradingHistory(pair);
        ExchangeDataEventBus.$emit('snapshotTrades', response);
    }

    subscribeLiveTrades(pair) {
        this.websocket.send(
            JSON.stringify({
                op: 'subscribe',
                args: [`trade:${pair}`, ],
            })
        );
    }
    subscribeInstrument(pair) {
        this.websocket.send(
            JSON.stringify({
                op: 'subscribe',
                args: [`instrument:${pair}`, ],
            })
        );
    }
    subscribeOrderBook(pair) {
        this.websocket.send(
            JSON.stringify({
                op: 'subscribe',
                args: [`orderBookL2_25:${pair}`, ],
            })
        );
    }
    unsubscribeLiveTrades(pair) {
        this.websocket.send(
            JSON.stringify({
                op: 'unsubscribe',
                args: [`trade:${pair}`, ],
            })
        );
    }
    unsubscribeInstrument(pair) {
        this.websocket.send(
            JSON.stringify({
                op: 'unsubscribe',
                args: [`instrument:${pair}`, ],
            })
        );
    }
    unsubscribeOrderBook(pair) {
        this.websocket.send(
            JSON.stringify({
                op: 'unsubscribe',
                args: [`orderBookL2_25:${pair}`, ],
            })
        );
    }

    unsubscribeAll(pair) {
        this.websocket.send(
            JSON.stringify({
                op: 'unsubscribe',
                args: [`orderBookL2_25:${pair}`, `trade:${pair}`, `instrument:${pair}`, ],
            })
        );
    }

    handleOrderBook(self, data) {
        if (data.action === 'partial') {
            self.precisionNumberN = 1;
        }
        if (data.data[0].price < 10 && data.data[0].price > 1) {
            self.precisionNumber = {
                0: 0,
                1: 0.001,
                2: 0.01,
                3: 0.1,
            };
        } else if (data.action === 'partial' && data.data[0].price > 10) {
            self.precisionNumber = {
                0: 0,
                1: 1,
                2: 10,
                3: 100,
            };
        } else if (data.data[0].price < 1) {
            self.precisionNumber = {
                0: 0,
                1: 0.0001,
                2: 0.001,
                3: 0.01,
            };
        }
        data.precision = self.precisionNumber[self.precisionNumberN];
        this.bitmexWorker.postMessage(data);
        this.bitmexWorker.onmessage = function(e) {
            self.latestOrderBook = e.data;
            if (self.latestOrderBook.isSnapshot === true) {
                self.isSnapshot = true;
            }
            // ExchangeDataEventBus.$emit('snapshotOrderbook', e.data);
        };
    }

    startEmitingObData() {
        this.obInterval = setInterval(() => {
            // if(this.latestOrderBook.asks) {
            if (this.isSnapshot) {
                ExchangeDataEventBus.$emit('snapshotOrderbook', this.latestOrderBook);
                this.isSnapshot = false;
            } else {
                ExchangeDataEventBus.$emit('updateOrderbook', this.latestOrderBook);
            }
            // }
        }, 500);
    }

    refreshOrderBook(pair) {
        this.unsubscribeOrderBook(pair);
        this.subscribeOrderBook(pair);
    }

    handleTrades(self, data) {
        let unsortData = data.data;
        if (data.action === 'partial') {
            let obj = {};
            let arr = unsortData.map(elem => {
                obj.price = Number(elem.price);
                obj.timeStamp = this.dateToDisplayTime(
                    new Date(elem.timestamp.toString()).getTime()
                );
                obj.volume = Math.abs(elem.size);
                obj.buyOrSell = elem.side.toLowerCase();
                // self.arr.push(obj);
                return obj;
            });
            ExchangeDataEventBus.$emit('liveTrades', arr[0]);
        } else if (data.action === 'insert') {
            let obj = {};
            let arr = unsortData.map(elem => {
                obj.price = Number(elem.price);
                obj.timeStamp = this.dateToDisplayTime(
                    new Date(elem.timestamp.toString()).getTime()
                );
                obj.volume = Math.abs(elem.size);
                obj.buyOrSell = elem.side.toLowerCase();
                // self.arr.push(obj);
                return obj;
            });
            ExchangeDataEventBus.$emit('liveTrades', arr[0]);
        }
    }
    dateToDisplayTime(date) {
        date = new Date(date);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return `${hours < 10 ? '0' : ''}${hours}:${
      minutes < 10 ? '0' : ''
    }${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    handleInstrument(self, data) {
        if (data.action === 'partial') {
            let obj = {};
            obj.ask = data.data[0].askPrice;
            obj.bid = data.data[0].bidPrice;
            obj.high = data.data[0].highPrice;
            obj.low = data.data[0].lowPrice;
            obj.last = data.data[0].lastPrice;
            obj.volume = data.data[0].volume;
            obj.symbol = data.data[0].symbol;
            obj.percentage = data.data[0].lastChangePcnt;
            obj.index = data.data[0].markPrice;
            obj.openInterest = data.data[0].openInterest;
            obj.funding = data.data[0].fundingRate;
            obj.fundingInterval = data.data[0].fundingInterval;
            obj.exchange = 'bitmex';
            self.tickerObj = obj;
            store.state.buyPrice = obj.ask;
            store.state.sellPrice = obj.bid;
        } else if (data.action === 'update') {
            self.tickerObj.ask = data.data[0].askPrice ?
                data.data[0].askPrice :
                self.tickerObj.ask;
            self.tickerObj.bid = data.data[0].bidPrice ?
                data.data[0].bidPrice :
                self.tickerObj.bid;
            self.tickerObj.high = data.data[0].highPrice ?
                data.data[0].highPrice :
                self.tickerObj.high;
            self.tickerObj.low = data.data[0].lowPrice ?
                data.data[0].lowPrice :
                self.tickerObj.low;
            self.tickerObj.last = data.data[0].lastPrice ?
                data.data[0].lastPrice :
                self.tickerObj.last;
            self.tickerObj.volume = data.data[0].volume ?
                data.data[0].volume :
                self.tickerObj.volume;
            self.tickerObj.symbol = data.data[0].symbol ?
                data.data[0].symbol :
                self.tickerObj.symbol;
            self.tickerObj.percentage = data.data[0].lastChangePcnt ?
                data.data[0].lastChangePcnt :
                self.tickerObj.percentage;
            self.tickerObj.openInterest = data.data[0].openInterest ?
                data.data[0].openInterest :
                self.tickerObj.openInterest;
            self.tickerObj.funding = data.data[0].fundingRate ?
                data.data[0].fundingRate :
                self.tickerObj.funding;
            self.tickerObj.fundingInterval = data.data[0].fundingInterval ?
                data.data[0].fundingInterval :
                self.tickerObj.fundingInterval;
            self.tickerObj.index = data.data[0].markPrice ?
                data.data[0].markPrice :
                self.tickerObj.index;
            store.state.buyPrice = self.tickerObj.ask;
            store.state.sellPrice = self.tickerObj.bid;
        }
        ExchangeDataEventBus.$emit('ticker', self.tickerObj);
    }
    subscribingBitmex() {
        let self = this;
        ExchangeDataEventBus.$on('change-symbol', pair => {
            this.subscribeAll(pair);
        });
        ExchangeDataEventBus.$on('change-precision', function({
            precisionNumber,
        }) {
            self.precisionNumberN = precisionNumber;
        });
    }
}

let i = new Bitmex();
export default i;