<template src="./template.html"></template>

<script>
import DepositService from '@/services/DepositService.js';

export default {
  name: 'bitfinex-deposit-address',
  components: {
  },
  
  data() {
    return {
      selectedMethod: 'SELECT A CURRENCY',
      destinationAddress: '',
      bitfinexMethodTypes: ['bitcoin', 'litecoin', 'ethereum', 'tetheruso', 'ethereumc', 'zcash', 'monero', 'iota', 'bcash',],
    };
  },
  methods: {
    async changeSelectedMethod (newVal) {
      this.selectedMethod = newVal;
      let data = [];
      data = await DepositService.fetchBitfinexDespositAddress('bitfinex', newVal);
      if(data.status) {
        if(data.data.result) {
          this.destinationAddress = data.data.address;
        } else {
          this.destinationAddress = '';
        }
      }
      else {
        this.destinationAddress = '';
        this.$showErrorMsg({
          message: 'Error Fetching Wallet Details',
        });
      }
    },
    copyReferral() {
      let copyText = document.querySelector('#destination_Address');
      copyText.select();
      copyText.select();
      document.execCommand('copy');
      // alert("Copied the text: " + copyText.value);
      this.$showSuccessMsg({ message: 'Wallet Address copied successfully.', });
    }, 
  },
};
</script>
<style lang="scss" src="./style.scss" scoped>

</style>
