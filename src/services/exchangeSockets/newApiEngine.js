import ExchangeDataEventBus from '@/eventBuses/exchangeData';

class TickerEngine {
  constructor() {
    this.tickerWs;
    this.ExchangeDataEventBus = ExchangeDataEventBus;
    this.state = {
      _constants: {
        baseAddress: process.env.VUE_APP_MARKETS_URL,
      },
    };
    this.initListeners();
  }
  connectToTickerEngine() {
    const {
      _constants,
    } = this.state;
    this.tickerWs = new WebSocket(_constants.baseAddress);
    this.tickerWs.onmessage  = (msg) => this.handleMessage(msg);
    this.tickerWs.onerror = () => this.connectToTickerEngine();
  }
  disconnectFromTickerEngine() {

    this.tickerWs.close();
  }
  handleMessage(msg) {
    let data = JSON.parse(msg.data);
    this.ExchangeDataEventBus.$emit('ticker-new-update', data);

  }
  initListeners() {
    this.ExchangeDataEventBus.$on('ticker-connect', () => this.connectToTickerEngine());
    this.ExchangeDataEventBus.$on('ticker-disconnect', () => this.disconnectFromTickerEngine());
  }

}

new TickerEngine();
