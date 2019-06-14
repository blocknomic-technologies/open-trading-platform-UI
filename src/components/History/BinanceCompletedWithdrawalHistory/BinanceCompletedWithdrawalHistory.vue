<template src="./template.html"></template>

<script>
import HistoryService from '@/services/HistoryService.js';
import { dateToDisplayDateTime, } from '@/utils/utility';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'binance-completed-withdrawal-history',
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
    data = await HistoryService.binancewithdrawalHistoryData('binance');
    let parsedData = [];
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
      parsedData = JSON.parse(data.data);
      parsedData = parsedData.withdrawList;
      parsedData.forEach((val) => {
        let obj = {};
        if(val.status === 6) {
          obj.id = val.id;
          obj.amount = val.amount;
          obj.address = val.address;
          obj.asset = val.asset;
          obj.txId = val.txId;
          obj.applyTime = new Date(val.applyTime);
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


