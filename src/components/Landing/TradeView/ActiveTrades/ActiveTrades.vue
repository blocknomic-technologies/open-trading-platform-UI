<template src="./template.html"></template>

<script>
import TradeService from '@/services/TradeService';
import { dateToDisplayDateTime, } from '@/utils/utility';
// import EventBus, { EventNames, } from '@/eventBuses/default';

export default {
  name: 'active-trades',
  components: {},
  props: {
    open: {
      type: Boolean,
    },
  },
  computed: {
    activeOrders() {
      return this.mapActiveOrders(this.$store.getters.activeOrders);
    },
  },
  mounted() {
    // this.userLoginListener = () => this.getActiveOrders();
    // // this.userLogoutListener = () => (this.activeOrders = []);
    // EventBus.$on(EventNames.userLogin, this.userLoginListener);
    // // EventBus.$on(EventNames.userLogout, this.userLogoutListener);
  },
  methods: {
    async getActiveOrders() {
      let activeOrders = await TradeService.getActiveOrders();
      activeOrders.status &&
        this.$store.commit('activeOrders', activeOrders.data);
    },
    toggleOpen() {
      this.$emit('toggle-open');
    },
    formatDateTime(timestamp) {
      return dateToDisplayDateTime(new Date(timestamp));
    },
    async cancelOrder(id) {
      this.$store.commit('addLoaderTask', 1, false);
      const response = await TradeService.cancelOrder({
        orderId: id,
      });
      if (response.status) {
        this.$showSuccessMsg({
          message: response.data.message,
        });
      } else {
        this.$showErrorMsg({
          message: response.data.message,
        });
      }
      this.$store.commit('removeLoaderTask', 1);
    },
    mapActiveOrders(rtArr = []) {
      return rtArr.map(rt => ({
        id: rt.id,
        orderId: rt.clientOrderId,
        tTime: new Date(rt.placedTime * 1000),
        amount: parseFloat(rt.amount),
        avgPrice: parseFloat(rt.avgPrice),
        buyOrSell: rt.buyOrSell,
        exchange: rt.exchange,
        orderType: rt.orderType,
        stopPrice: parseFloat(rt.stopPrice) || '--',
        status: rt.status,
        pair: rt.pair,
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


