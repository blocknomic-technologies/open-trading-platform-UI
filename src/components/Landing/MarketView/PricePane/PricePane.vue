<template src="./template.html"></template>

<script>
// import '@/services/exchangeSockets/bequant';
// import '@/services/exchangeSockets/bitfinex';
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import PriceAnalysis from './PriceAnalysis/PriceAnalysis.vue';
import TradingView from './TradingView/TradingView.vue';
export default {
  name: 'price-pane',
  components: {
    PriceAnalysis,
    TradingView,
  },
  data() {
    return {
      isTradingView: true,
    };
  },
  created() {
    this.subscribeExchangeListener = () => {
      this.isTradingView = false;
      setTimeout(() => (this.isTradingView = true), 10);
    };
    ExchangeDataEventBus.$on('change-symbol', this.subscribeExchangeListener);
    ExchangeDataEventBus.$on(
      'subscribe-exchange',
      this.subscribeExchangeListener
    );
  },
  destroyed() {
    ExchangeDataEventBus.$off(
      'subscribe-exchange',
      this.subscribeExchangeListener
    );
  },
  methods: {},
};
</script>


<style lang="scss" src="./style.scss" scoped></style>
