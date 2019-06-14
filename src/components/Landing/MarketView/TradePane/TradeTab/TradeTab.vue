<template src="./template.html"></template>

<script>
import TabBar from '@/components/TabBar/TabBar.vue';
import MarketOrder from './MarketOrder/MarketOrder.vue';
import LimitOrder from './LimitOrder/LimitOrder.vue';
import StopLimitOrder from './StopLimitOrder/StopLimitOrder.vue';
import StopMarketOrder from './StopMarketOrder/StopMarketOrder.vue';
import ExchangeDataEventBus from '@/eventBuses/exchangeData';

export default {
  name: 'trade-tab',
  components: {
    TabBar,
    MarketOrder,
    LimitOrder,
    StopLimitOrder,
    StopMarketOrder,
  },
  data() {
    return {
      activeTab: 'Market',
      selectedPair: 'BTC/USD',
      tabs: ['Market', 'Limit','Stop Limit','Stop Market',],
      preActive: 'Market',
    };
  },
  methods: {
    activeTabChange(activeTab) {
      this.activeTab = activeTab;
      // if (activeTab == "Market") {
      //   this.$store.commit("changeMarketTab");
      // } else {
      //   this.$store.commit("changeLimitTab");
      // }
      if (this.preActive !== activeTab) {
        this.$root.$emit('tabChange', activeTab);
        this.preActive = activeTab;
      }
    },
    pairChange() {
      this.$store.commit('addLoaderTask', 3, false);
      // console.log(this.$store.getters.getSelectedPairExchanges, "lovish");
      this.$store.commit('setAvailableExchanges');
      ExchangeDataEventBus.$emit(
        'change-symbol',
        this.$store.state.selectedPair
      );
    },
  },
};
</script>

<style lang="scss" src="./style.scss" scoped></style>
