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
      statusCode: 'major_outage',
    };
  },
  components: {
    ModelSelect,
  },
  methods: {
    // myFunction() {
    //   document.getElementById('myDropdown').classList.toggle('show');
    // },

    // filterFunction() {
    //   let input, filter, ul, li, a, i;
    //   input = document.getElementById('myInput');
    //   filter = input.value.toUpperCase();
    //   div = document.getElementById('myDropdown');
    //   a = div.getElementsByTagName('a');
    //   for (i = 0; i < a.length; i++) {
    //     txtValue = a[i].textContent || a[i].innerText;
    //     if (txtValue.toUpperCase().indexOf(filter) > -1) {
    //       a[i].style.display = '';
    //     } else {
    //       a[i].style.display = 'none';
    //     }
    //   }
    // },
    onTriggerClick() {
      this.$store.commit('toggleSidebar');
    },
    getPageStatus() {
      let data = this.$store.getters.getPageStatus;
      if (data === 'All Systems Operational') {
        this.statusCode = 'operational';
        return 'All Systems Operational';
      } else if (data === 'Partial System Outage') {
        this.statusCode = 'partial_outage';
        return 'Partial System Outage';
      } else if (data === 'Major Service Outage') {
        this.statusCode = 'major_outage';
        return 'Major Service Outage';
      }  else if (data === 'Minor Service Outage') {
        this.statusCode = 'partial_outage';
        return 'Minor Service Outage';
      }  else if (data === 'Major System Outage') {
        this.statusCode = 'major_outage';
        return 'Major System Outage';
      } else {
        this.statusCode = 'partial_outage';
        return 'Partial System Outage';
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
