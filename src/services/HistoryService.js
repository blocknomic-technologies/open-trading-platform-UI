import ApiCurryBase from './ApiCurryBase';

class History {
  async bequantTradingHistoryData(exchange) {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/bequant-trade-history-request', { exchange, })).data;
  }
  async bequantTransactionHistoryData(exchange) {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/bequant-transaction-history-request', { exchange, })).data;
  }
  async bitfinexTradingHistoryData(exchange) {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/bitfinex-trade-history-request', { exchange, })).data;
  }
  async bitfinexTransactionHistoryData(exchange) {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/bitfinex-transaction-history-request', { exchange, })).data;
  }
  async binancewithdrawalHistoryData(exchange) {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/binance-withdraw-history-request', { exchange, })).data;
  }
  async binancedepositHistoryData(exchange) {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/binance-deposit-history-request', { exchange, })).data;
  }
  async binanceTradingHistoryData(exchange, symbol) {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/binance-trading-history-request', { exchange, symbol, })).data;
  }
  async binanceOrdersHistoryData(symbol) {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/binance-order-history-request', { symbol, })).data;
  }
  async bequantOrdersHistoryData() {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/bequant-order-history-request')).data;
  }
  async bitfinexOrdersHistoryData() {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/bitfinex-order-history-request')).data;
  }
  async bitfinexPositionsHistoryData() {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/bitfinex-positions-history-request')).data;
  }

  async bitmexOrderHistory() {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/fetch-bitmex-order-history')).data;
  }
  async bitmexSwapFundingHistory() {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/fetch-bitmex-swap-funding-history')).data;
  }

  async bitmexPositionsHistory() {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/fetch-bitmex-positions-history')).data;
  }
  async bitmexOpenPositions() {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/fetch-bitmex-open-positions')).data;
  }

  async bitmexLiquidationOrderHistory() {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/bitmex-liquidation-orders')).data;
  }

  async bitmexTradingHistory() {
    // console.log((await ApiCurryBase.post('/bitfinex-wallet-transfer-request', body)).data)
    return (await ApiCurryBase.post('/bitmex-trading-history')).data;
  }

}

export default new History();
