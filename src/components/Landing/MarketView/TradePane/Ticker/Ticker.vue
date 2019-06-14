<template src="./template.html"></template>

<script>
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'ticker',
  components: {
    Spinner,
  },
  data() {
    return {
      tickerObj: {},
      showLoader: false,
      toggleOn: true,
      toggleFees: false,
    };
  },
  created() {
    if (JSON.stringify(this.$store.state.tickerData) == '{}') {
      this.showLoader = true;
    }
    setTimeout(() => {
      this.showLoader = false;
    }, 1000);
  },
  methods: {
    tickerClick(tickerObj) {
      this.$store.commit('selectedPair', tickerObj.pair);
      this.$store.commit('setAvailableExchanges');
      ExchangeDataEventBus.$emit('change-symbol', tickerObj.pair);
      this.$root.$emit('tickerClicked');
    },
    toggle(e) {
      e.preventDefault();
      this.toggleOn = !this.toggleOn;
      e.target.innerHTML = e.target.innerHTML === 'Fees Off' ? 'Fees On' : 'Fees Off';
    },
  },
};
</script>

<style lang="scss" src="./style.scss" scoped></style>

