<template src="./template.html"></template>

<script>
import TabBar from '@/components/TabBar/TabBar.vue';
import CryptoWithdrawls from '@/components/Withdrawl/CryptoWithdrawls/CryptoWithdrawls.vue';
import CashWithdrawls from '@/components/Withdrawl/CashWithdrawls/CashWithdrawls.vue';

export default {
  name: 'withdrawl',
  components: {
    TabBar,
    CryptoWithdrawls,
    CashWithdrawls,
  },
  data() {
    return {
      activeTab: 'Crypto',
      tabs: ['Crypto',],
    };
  },
  methods: {
    onTabChange(activeTab) {
      this.activeTab = activeTab;
    },
  },
};
</script>
