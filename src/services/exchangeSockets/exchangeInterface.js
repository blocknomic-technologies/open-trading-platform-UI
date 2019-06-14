import Bitfinex from '@/services/exchangeSockets/bitfinex';
import Binance from '@/services/exchangeSockets/binance';
import bequant from '@/services/exchangeSockets/bequant';

class ExchangeInterface {
  constructor() {
    this.ctxs = {
      'bitfinex': new Bitfinex(),
      'binance': new Binance(),
      'bequant': new bequant(),
    };
  }

  init(defaultExchange, defaultPair) {
    this.ExchangeDataEventBus.$on('change-symbol', (pair) => this.changePair(pair));
    this.initAllListeners();
    this.ctxs[defaultExchange].subscribePair(defaultPair);
    this.ctx = this.ctxs[defaultExchange];

  }

  initAllListeners() {
    let exchanges = Object.keys(this.ctxs);
    for (let i = 0; i < exchanges.length; i++) {
      this.ctxs[exchanges[i]].initListeners();
    }
  }

  changeExchange(newExchange) {
    this.ctx.unsubcribe();
    this.ctxs[newExchange].subscribe();
    this.ctx = this.ctxs[newExchange];
  }


  changePair(pair) {
    let exchanges = Object.keys(this.ctxs);
    for (let i = 0; i < exchanges.length; i++) {
      if (this.ctx === this.ctxs[exchanges[i]]) {
        this.ctxs[exchanges[i]].subscribePair(pair);
      } else {
        this.ctxs[exchanges[i]].subscribeTicker(pair);

      }
    }
  }
}

const instance = new ExchangeInterface();
instance.init('bitfinex', 'BTC/USD');

export default ExchangeInterface;
