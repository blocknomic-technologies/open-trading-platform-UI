<template src="./template.html"></template>

<script>
import { ModelSelect, } from 'vue-search-select';
import WalletService from '@/services/WalletService.js';
import EventBus, { EventNames, } from '@/eventBuses/default';

export default {
  name: 'header-section',
  data() {
    return {
      status: 'Major Outage',
      serverStatusCode: 'major_outage',
    };
  },
  components: {
    ModelSelect,
  },
  methods: {
    onTriggerClick() {
      this.$store.commit('toggleSidebar');
    },
    getServerStatus() {
      let data = this.$store.getters.websocketStatus;
      if (data === 'Connected') {
        this.serverStatusCode = 'operational';
        return 'Server Connected';
      } else if (data === 'Error') {
        this.serverStatusCode = 'major_outage';
        return 'Some Error in Connecting to Server';
      } else {
        this.serverStatusCode = 'partial_outage';
        return 'Server Closed';
      }
    },
    logout() {
      EventBus.$emit(EventNames.userLogout);
      this.$showSuccessMsg({
        message: 'Logged Out Successfully',
      });
    },
    showDepositModal() {
      this.$store.commit('closeSidebar');
      this.$emit('show-withdrawl-modal');
    },
    showWithdrawlModal() {
      this.$store.commit('closeSidebar');
      this.$emit('show-deposit-modal');
    },
    async refreshBalances(){
      await WalletService.refreshWalletBalances();
    },
    showTwoFAuthenticationModal() {
      this.$store.commit('closeSidebar');
      this.$emit('show-TwoFAuthentication-modal');
    },
  },
};
</script>

<style lang="scss" src="./style.scss" scoped></style>
