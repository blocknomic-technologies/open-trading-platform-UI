<template src="./template.html"></template>

<script>
import LiveTrades from './LiveTrades/LiveTrades.vue';
import OrderBook from './OrderBook/OrderBook.vue';

export default {
  name: 'book-pane',
  components: {
    LiveTrades,
    OrderBook,
  },
  data() {
    return {
      height: 0,
      timeout: '',
    };
  },
  created() {
    this.timeout = setInterval(() => {
      this.height = this.$refs.sidePane.clientHeight;
    }, 10);
  },
  mounted() {},
  updated() {
    this.height = this.$refs.sidePane.clientHeight;
  },
  destroyed() {
    clearInterval(this.timeout);
  },
};
</script>


<style lang="scss" src="./style.scss" scoped></style>
