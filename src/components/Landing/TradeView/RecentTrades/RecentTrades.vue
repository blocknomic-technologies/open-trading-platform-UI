<template src="./template.html"></template>

<script>
import TradeService from '@/services/TradeService';
import { dateToDisplayDateTime, } from '@/utils/utility';
// import EventBus, { EventNames, } from '@/eventBuses/default';

export default {
  name: 'recent-trades',
  components: {},
  props: {
    open: {
      type: Boolean,
    },
  },
  data() {
    return {
      showTotal: false,
    };
  },
  mounted() {
    // this.userLoginListener = () => this.getRecentTrades();
    // // this.userLogoutListener = () => (this.recentTrades = []);
    // EventBus.$on(EventNames.userLogin, this.userLoginListener);
    // EventBus.$on(EventNames.userLogout, this.userLogoutListener);
  },
  computed: {
    recentTrades() {
      return this.mapRecentTrades(this.$store.getters.recentTrades);
    },
  },
  methods: {
    async getRecentTrades() {
      let recentTrades = await TradeService.getRecentOrders();
      recentTrades.status &&
        this.$store.commit('recentTrades', recentTrades.data);
    },
    toggleOpen() {
      this.$emit('toggle-open');
    },
    formatDateTime(timestamp) {
      return dateToDisplayDateTime(new Date(timestamp));
    },
    mapRecentTrades(rtArr = []) {
      return rtArr.map(rt => ({
        id: rt.id,
        orderId: rt.clientOrderId,
        tTime: new Date(rt.tTime * 1000),
        amount: parseFloat(rt.amount),
        avgPrice: parseFloat(rt.avgPrice),
        feeString: `${parseFloat(rt.fee)} ${rt.feeCurrency}`,
        fee: parseFloat(rt.fee),
        feeCurrency: rt.feeCurrency,
        buyOrSell: rt.buyOrSell,
        exchange: rt.exchange,
        orderType: rt.orderType,
        exchangeFeeString: `${parseFloat(rt.exchangeFee)} ${rt.exchangeFeeCurrency}`,
        exchangeFee: parseFloat(rt.exchangeFee),
        exchangeFeeCurrency: rt.exchangeFeeCurrency,
        status: rt.status,
        pair: rt.pair,
        basePair: (rt.pair.split('/'))[0],
        quotePair: (rt.pair.split('/'))[1],
      }));
    },
  },
  destroyed() {
    // EventBus.$off(EventNames.userLogin, this.userLoginListener);
    // EventBus.$off(EventNames.userLogout, this.userLogoutListener);
  },
};
</script>

<style lang="scss" src="./style.scss" scoped></style>


