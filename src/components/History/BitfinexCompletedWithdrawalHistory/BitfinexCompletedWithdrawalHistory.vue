<template src="./template.html"></template>

<script>
import HistoryService from '@/services/HistoryService.js';
import { dateToDisplayDateTime, } from '@/utils/utility';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'bitfinex-completed-withdrawal-history',
  components: {
    Spinner,
  },
  data() {
    return {
      history: [],
      spinnerFlag: true,
      displayText: 'No Records Found.',
    };
  },
  async created() {
    this.$store.commit('addLoaderTask', 1, false);
    let data = [];
    data = await HistoryService.bitfinexTransactionHistoryData('bitfinex');
    let newData = [];
    if(data.data.error) {
      this.spinnerFlag = false;
      this.history = [];
      this.displayText = 'Invalid API-KEY or API-KEYS not Entered.';
      this.$showErrorMsg({
        message: 'Notice: Invalid API-KEY or API-KEYS not Entered.',
      });
    } else {
      this.spinnerFlag = false;
      data.data.forEach((val) => {
        let obj = {};
        if(val[12]<0 && val[9] === 'COMPLETED') {
          obj.id = val[0] || '-';
          obj.currency = val[1] || '-';
          obj.currencyName = val[2] || '-';
          obj.movementLastUpdated = new Date(val[6]) || '-';
          obj.amount = val[12] || '-';
          obj.fees = (val[13]* (-1)) || '-';
          obj.destinationAddress = val[16] || '-';
          obj.transactionHash = val[20] || '-';
          newData.push(obj);
        }
      });
    }
    this.history = newData;
    if(this.history.length === 0 && this.displayText !== 'Invalid API-KEY or API-KEYS not Entered.')
      this.displayText = 'No Records Found.';
    this.$store.commit('removeLoaderTask', 1);
  },
  methods: {
    formatDateTime(timestamp) {
      return dateToDisplayDateTime(new Date(timestamp));
    },
    copyReferral(id) {
      let copyText = document.querySelector(`#txhash${id}`);
      copyText.select();
      copyText.select();
      document.execCommand('copy');
      // alert("Copied the text: " + copyText.value);
      this.$showSuccessMsg({ message: 'Transaction Hash copied successfully.', });
    }, 
  },
};
</script>
<style lang="scss" src="./style.scss" scoped>
</style>


