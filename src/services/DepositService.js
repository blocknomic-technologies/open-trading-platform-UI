import ApiCurryBase from './ApiCurryBase';

class DepositService {
  async fetchBitfinexDespositAddress(exchange, currency) {
    return (await ApiCurryBase.post('/bitfinex-deposit-address-request', {
      exchange,
      currency,

    })).data;
  }
  async fetchBequantDespositAddress(exchange, currency) {
    return (await ApiCurryBase.post('/bequant-deposit-address-request', {
      exchange,
      currency,
    })).data;
  }
  async fetchBinanceDespositAddress(exchange, currency) {
    return (await ApiCurryBase.post('/binance-deposit-address-request', {
      exchange,
      currency,
    })).data;
  }
  async bitmexGetDepositAddress() {
    return (await ApiCurryBase.get('/bitmex-deposit-address')).data;

  }
}

export default new DepositService();
