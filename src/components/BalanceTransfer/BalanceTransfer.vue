<template src="./template.html"></template>

<script>
import TabBar from '@/components/TabBar/TabBar.vue';

export default {
  name: 'balance-transfer',
  components: {
    TabBar,
  },
  data() {
    return {
      activeTab: 'BITFINEX',
      tabs: [
        'BINANCE',        
        'BITFINEX',
        'BEQUANT',
        'BITMEX',
      ],
      tabRouteMapping: {
        'BINANCE': '/balance',            
        'BITFINEX': '/balance/wallet-summary-bitfinex',
        'BEQUANT': '/balance/wallet-summary-bequant',
        'BITMEX': '/balance/wallet-summary-bitmex',
      },
    };
  },
  methods: {
    onTabChange(activeTab) {
      this.activeTab = activeTab;
    },
  },
};
</script>
<style lang="scss" src="./style.scss" scoped>

</style>
