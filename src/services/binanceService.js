import ApiCurryBase from './ApiCurryBase';

class BinanceService {
  async binanceData(params) {
    return (await ApiCurryBase.get(`/get-binance-data?pair=${params.pair}`)).data;
  }
  async binanceKlineData(params) {
    return (await ApiCurryBase.get(`/get-binance-kline-data?symbol=${params.pair}&interval=${params.interval}`)).data;
  }

}

export default new BinanceService();
