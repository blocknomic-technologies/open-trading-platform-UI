<template src="./template.html"></template>

<script>
import EventBus, { EventNames, } from '@/eventBuses/default';

export default {
  name: 'side-menu',
  watch: {
    $route() {
      this.$store.commit('closeSidebar');
    },
  },
  methods: {
    onTriggerClick() {
      this.$store.commit('toggleSidebar');
    },
    showDepositModal() {
      this.$store.commit('closeSidebar');
      this.$emit('show-withdrawl-modal');
    },
    showWithdrawlModal() {
      this.$store.commit('closeSidebar');
      this.$emit('show-deposit-modal');
    },
    showTwoFAuthenticationModal() {
      this.$store.commit('closeSidebar');
      this.$emit('show-TwoFAuthentication-modal');
    },
    logout() {
      EventBus.$emit(EventNames.userLogout);
      this.$showSuccessMsg({
        message: 'Logged Out Successfully',
      });
    },
  },
};
</script>

<style lang="scss" src="./style.scss" scoped></style>
