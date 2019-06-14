<template src="./template.html"></template>

<script>
// import '@/services/exchangeSockets/bequant';
// import '@/services/exchangeSockets/bitfinex';
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import MultiLine from './MultiLine/MultiLine.vue';
import PriceAnalysis from './PriceAnalysis/PriceAnalysis.vue';
import TradingView from './TradingView/TradingView.vue';
export default {
  name: 'price-pane',
  components: {
    MultiLine,
    PriceAnalysis,
    TradingView,
  },
  data() {
    return {
      isTradingView: true,
    };
  },
  created() {
    this.toggleMultiline = () => (this.isMultiLine = !this.isMultiLine);
    this.subscribeExchangeListener = () => {
      this.isTradingView = false;
      setTimeout(() => (this.isTradingView = true), 10);
    };
    ExchangeDataEventBus.$on('change-symbol', this.subscribeExchangeListener);
    ExchangeDataEventBus.$on('toggle-multiline', this.toggleMultiline);
    ExchangeDataEventBus.$on(
      'subscribe-exchange',
      this.subscribeExchangeListener
    );
  },
  destroyed() {
    ExchangeDataEventBus.$off('toggle-multiline', this.toggleMultiline);
    ExchangeDataEventBus.$off(
      'subscribe-exchange',
      this.subscribeExchangeListener
    );
  },
  methods: {},
};
</script>


<style lang="scss" src="./style.scss" scoped></style>
