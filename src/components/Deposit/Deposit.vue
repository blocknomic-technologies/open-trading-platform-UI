<template src="./template.html"></template>

<script>
import BitfinexDepositAddress from './BitfinexDepositAddress/BitfinexDepositAddress';
import BinanceDepositAddress from './BinanceDepositAddress/BinanceDepositAddress';
import BequantDepositAddress from './BequantDepositAddress/BequantDepositAddress';
import BitmexDepositAddress from './BitmexDepositAddress/BitmexDepositAddress';

export default {
  name: 'deposit',
  components: {
    BitfinexDepositAddress,
    BinanceDepositAddress,
    BequantDepositAddress,
    BitmexDepositAddress,
  },
  data () {
    return {
      activeTab: 'Bitfinex',
      tabs: ['Bitfinex', 'Bequant', 'Binance', 'Bitmex',],
    };
  },
  methods: {
    onDropDownTabChange(tab) {
      this.activeTab = tab;
    },
  },
};
</script>
<style src="./style.scss" lang="scss" scoped>

</style>
