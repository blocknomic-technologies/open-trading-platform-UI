<template src="./template.html"></template>

<script>
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import { ModelSelect, } from 'vue-search-select';
import { setInterval, clearInterval, } from 'timers';
export default {
  name: 'margin-markets',
  props: ['marginData', 'availableIndices', 'availableContracts',],
  components: {
    ModelSelect,
  },
  data() {
    return {
      exchanges: ['bitmex',],
      selectedMarginExchange: { text: 'Bitmex', value: 'bitmex', },
      selectedMarginInsType: {},
      selectedMarginPair: {},
      marginExchangeList: [{ text: 'Bitmex', value: 'bitmex', },],
      marginHeadingList: [
        { text: 'Contracts', value: 'contracts', },
        { text: 'Indices', value: 'indices', },
      ],
      marginPairsList: [],
      pairsList: {
        contracts: [],
        indices: [],
      },
      selectedpairData: [],
      interval: '',
    };
  },
  watch: {
    // selectedpairData: function handler(newVal) {
    // },
    selectedMarginInsType: function handler(newVal) {
      if (newVal.value === 'contracts') {
        this.marginPairsList = this.availableContracts;
      } else {
        this.marginPairsList = this.availableIndices;
      }
    },
    selectedMarginPair: function handler(newVal) {
      this.getPairData(newVal.text);
    },
    availableContracts: function handler() {
      if (JSON.stringify(this.selectedMarginInsType) === JSON.stringify({})) {
        this.selectedMarginInsType = { text: 'Contracts', value: 'contracts', };
        this.selectedMarginPair = { text: 'XBTUSD', value: 'XBTUSD', };
      }
    },
  },
  created() {
    if (
      JSON.stringify(this.selectedMarginInsType) === JSON.stringify({}) &&
      this.availableContracts.length
    ) {
      this.selectedMarginInsType = { text: 'Contracts', value: 'contracts', };
      this.selectedMarginPair = { text: 'XBTUSD', value: 'XBTUSD', };
    }
    // console.log(this.marginData);
  },
  methods: {
    getPairData(pair) {
      if (this.interval !== '') {
        clearInterval(this.interval);
      }
      this.selectedpairData = this.marginData[pair];
      this.interval = setInterval(() => {
        this.selectedpairData = this.marginData[pair];
      }, 3000);
      // console.log(this.selectedpairData);
    },
    goToTrade() {
      this.$store.commit('selectedExchange', 'bitmex');
      this.$store.commit('selectedPair', this.selectedMarginPair.value);
      ExchangeDataEventBus.$emit(
        'change-symbol',
        this.selectedMarginPair.value
      );
      this.$store.commit('buyPrice', 0);
      this.$store.commit('sellPrice', 0);
      // ExchangeDataEventBus.$emit('subscribe-exchange', clickedData.Exchange.toLowerCase() );
      this.$store.state.tickerDataExc = {};
      ExchangeDataEventBus.$emit('afterSymbolAndExchangeChange');

      this.$router.push('/');
    },
  },
  destroyed() {
    clearInterval(this.interval);
  },
};
</script>
<style lang="scss" src="./style.scss" scoped>
</style>



