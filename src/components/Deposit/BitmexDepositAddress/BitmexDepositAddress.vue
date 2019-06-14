<template src="./template.html"></template>

<script>
import DepositService from '@/services/DepositService.js';

export default {
  name: 'bitmex-deposit-address',
  components: {
  },
  
  data() {
    return {
      selectedMethod: 'XBT',
      destinationAddress: '',
      bitmexMethodTypes: ['XBT',],
    };
  },
  async created() {
    this.selectedMethod = 'XBT';
    let data = [];
    data = await DepositService.bitmexGetDepositAddress();
    // console.log(data);
    if(data.data.error) {
      this.destinationAddress = '';
      this.$showErrorMsg({
        message: 'Error Fetching Wallet Details',
      });
    }
    else {
      if(data.data) {
        this.destinationAddress = JSON.parse(data.data);
      } else {
        this.destinationAddress = 'CREATE AN ADDRESS';
      }        
    }
  },
  methods: {
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
