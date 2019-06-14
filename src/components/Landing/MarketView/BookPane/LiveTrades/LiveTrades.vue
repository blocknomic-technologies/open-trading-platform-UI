<template src="./template.html"></template>

<script>
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'live-trades',
  components: {
    Spinner,
  },
  props: {
    parentHeight: Number,
  },
  data() {
    return {
      trades: [],
      tableHeight: '',
      showLoader:true,
    };
  },
  watch: {
    parentHeight: function(newVal) {
      let calcHeight = newVal;
      this.tableHeight = 'calc(100vh - ' + (calcHeight  + 100) + 'px';
    },
  },
  created() {
    this.snapshotListener = snap => {
      this.trades = snap;
      setTimeout(() => {
        this.showLoader=false;        
      }, 1000);
      const liveTrade = snap[0];
      let price;
      if (liveTrade.buyOrSell == 'sell') {
        price = -liveTrade.price;
      } else {
        price = liveTrade.price;
      }
      this.$store.commit('liveTradePrice', price);
      this.$store.commit('removeLoaderTask', 1);
    };
    this.reset = () => {
      this.showLoader=true;
      this.trades = [];
    };
    this.liveTradeListener = liveTrade => {

      this.trades.unshift(liveTrade);
      if (this.trades.length > 100) {
        this.trades.pop();
      }
      let price;
      if (liveTrade.buyOrSell == 'sell') {
        price = -liveTrade.price;
      } else {
        price = liveTrade.price;
      }
      this.$store.commit('liveTradePrice', price);
    };
    ExchangeDataEventBus.$on('snapshotTrades', this.snapshotListener);
    ExchangeDataEventBus.$on('liveTrades', this.liveTradeListener);
    ExchangeDataEventBus.$on('subscribe-exchange', this.reset);
    ExchangeDataEventBus.$on('change-symbol', this.reset);
  },
  destroyed() {
    ExchangeDataEventBus.$off('snapshotTrades', this.snapshotListener);
    ExchangeDataEventBus.$off('liveTrades', this.liveTradeListener);
  },
};
</script>
<style src="./style.scss" lang="scss"  scoped></style>
