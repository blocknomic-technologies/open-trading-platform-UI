<template src="./template.html"> 
</template>

<script>
import AccountInfo from '@/components/Settings/Trezor/AccountInfo/AccountInfo.vue';
import ReceivingAddress from '@/components/Settings/Trezor/ReceivingAddress/ReceivingAddress.vue';
import SendMoney from '@/components/Settings/Trezor/SendMoney/SendMoney.vue';


export default {
  name: 'trezor',
  components: {
    AccountInfo,
    ReceivingAddress,
    SendMoney,
  },
  data () {
    return {
      activeTab: 'Account Info',
      tabs: ['Account Info', 'Receiving Address', 'Send Money',],
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
