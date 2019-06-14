<template src="./template.html"></template>

<script>
import BequantDepositHistory from './BequantDepositHistory/BequantDepositHistory';
import BequantTradingHistory from './BequantTradingHistory/BequantTradingHistory';
import BequantCompletedWithdrawalHistory from './BequantCompletedWithdrawalHistory/BequantCompletedWithdrawalHistory';
import BequantPendingWithdrawalHistory from './BequantPendingWithdrawalHistory/BequantPendingWithdrawalHistory';
import BitfinexDepositHistory from './BitfinexDepositHistory/BitfinexDepositHistory';
import BitfinexTradingHistory from './BitfinexTradingHistory/BitfinexTradingHistory';
import BitfinexCompletedWithdrawalHistory from './BitfinexCompletedWithdrawalHistory/BitfinexCompletedWithdrawalHistory';
import BitfinexPendingWithdrawalHistory from './BitfinexPendingWithdrawalHistory/BitfinexPendingWithdrawalHistory';
import BinanceDepositHistory from './BinanceDepositHistory/BinanceDepositHistory';
import BinanceTradingHistory from './BinanceTradingHistory/BinanceTradingHistory';
import BinanceCompletedWithdrawalHistory from './BinanceCompletedWithdrawalHistory/BinanceCompletedWithdrawalHistory';
import BinancePendingWithdrawalHistory from './BinancePendingWithdrawalHistory/BinancePendingWithdrawalHistory';
import BequantOrdersHistory from './BequantOrdersHistory/BequantOrdersHistory';
import BinanceOrdersHistory from './BinanceOrdersHistory/BinanceOrdersHistory';
import BitfinexOrdersHistory from './BitfinexOrdersHistory/BitfinexOrdersHistory';
import BitfinexPositionsHistory from './BitfinexPositionsHistory/BitfinexPositionsHistory';
import BitmexOrderHistory from './BitmexOrderHistory/BitmexOrderHistory';
import BitmexSwapFundingHistory from './BitmexSwapFundingHistory/BitmexSwapFundingHistory';
import BitmexTradingHistory from './BitmexTradingHistory/BitmexTradingHistory';
import BitmexLiquidationOrderHistory from './BitmexLiquidationOrderHistory/BitmexLiquidationOrderHistory';


export default {
  name: 'history',
  components: {
    BequantDepositHistory,
    BequantTradingHistory,
    BequantPendingWithdrawalHistory,
    BequantCompletedWithdrawalHistory,
    BitfinexDepositHistory,
    BitfinexTradingHistory,
    BitfinexCompletedWithdrawalHistory,
    BitfinexPendingWithdrawalHistory,
    BinanceDepositHistory,
    BinanceTradingHistory,
    BinanceCompletedWithdrawalHistory,
    BinancePendingWithdrawalHistory,
    BequantOrdersHistory,
    BitfinexOrdersHistory,
    BitfinexPositionsHistory,
    BinanceOrdersHistory,
    BitmexOrderHistory,
    BitmexSwapFundingHistory,
    BitmexLiquidationOrderHistory,
    BitmexTradingHistory,
  },
  
  data() {
    return {
      selectedExchange: 'bitfinex',
      bequantFlag: false,
      bitfinexFlag: true,
      binanceFlag: false,
      bitmexFlag: false,
      bitfinexActiveTab: 'Orders',
      bequantActiveTab: 'Orders',
      binanceActiveTab: 'Orders',
      bitmexActiveTab: 'Orders',
      bitfinexTabs: ['Orders', 'Trading', 'Positions', 'Crypto Deposits', 'Crypto Withdrawal',],
      bequantTabs: ['Orders', 'Trading', 'Crypto Deposits', 'Crypto Withdrawal',],
      binanceTabs: ['Orders', 'Trading', 'Crypto Deposits', 'Crypto Withdrawal',],
      bitmexTabs: ['Orders', 'Trading', 'Swap Funding', 'Liquidation Orders',],

    };
  },
  methods: {
    onDropDownBitfinexTabChange(tab) {
      this.bitfinexActiveTab = tab;
    },
    onDropDownBequantTabChange(tab) {
      this.bequantActiveTab = tab;
    },
    onDropDownBinanceTabChange(tab) {
      this.binanceActiveTab = tab;
    },
    onDropDownBitmexTabChange(tab) {
      this.bitmexActiveTab = tab;
    },
    changeExchange(exchange) {
      this.selectedExchange = exchange;
      switch (this.selectedExchange) {
        case 'bitfinex': {
          this.bequantFlag = false;
          this.bitfinexFlag = true;
          this.binanceFlag = false;
          this.bitmexFlag = false;
          break;
        }
        case 'bequant': {
          this.bitfinexFlag = false;
          this.binanceFlag = false;
          this.bitmexFlag = false;
          this.bequantFlag = true;
          break;
        }
        case 'binance': {
          this.bitfinexFlag = false;
          this.bequantFlag = false;
          this.bitmexFlag = false;
          this.binanceFlag = true;
          break;
        }
        case 'bitmex': {
          this.bequantFlag = false;
          this.bitfinexFlag = false;
          this.binanceFlag = false;
          this.bitmexFlag = true;
          break;
        }
        default:
          break;
      }
    },
  },
};
</script>
<style lang="scss" src="./style.scss" scoped>

</style>
