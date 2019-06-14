<template src="./template.html"></template>

<script>
import DepositService from '@/services/DepositService.js';

export default {
  name: 'bequant-deposit-address',
  components: {
  },
  
  data() {
    return {
      selectedMethod: 'SELECT A CURRENCY',
      destinationAddress: '',
      bequantMethodTypes: [ 'BTC', 'ETH', 'LTC', 'ETC', 'XRP', 'EOS', 'BCH', 'NEO', 'BTG', 'BT', 'USD', 'BCCF', 'EURS', 'USDT', 'BCHABC', 'BCHSV', ],
    };
  },
  methods: {
    async changeSelectedMethod (newVal) {
      this.selectedMethod = newVal;
      let data = [];
      data = await DepositService.fetchBequantDespositAddress('bequant', newVal);
      // console.log(data);
      if(data.data.error) {
        this.destinationAddress = '';
        this.$showErrorMsg({
          message: 'Address Does Not Exist',
        });
      } else {
        let parsedData = [];
        parsedData = JSON.parse(data.data);
        this.destinationAddress = parsedData.address;
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
