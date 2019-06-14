<template src="./template.html"></template>

<script>
import HistoryService from '@/services/HistoryService.js';
// import { dateToDisplayDateTime, } from '@/utils/utility';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'bequant-completed-withdrawal-history',
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
    data = await HistoryService.bequantTransactionHistoryData('bequant');
    let newData = [];
    let parsedData = [];
    if(data.data.error) {
      this.spinnerFlag = false;
      this.history = [];
      this.displayText = 'Invalid API-KEY or API-KEYS not Entered.';
      this.$showErrorMsg({
        message: 'Notice: Invalid API-KEY or API-KEYS not Entered.',
      });
    }
    else {
      this.spinnerFlag = false;
      parsedData = JSON.parse(data.data);
      parsedData.forEach((val) => {
        let obj = {};
        if(val.type === 'payout' && val.status === 'success') {
          obj.id = val.id;
          obj.index = val.index;
          obj.status = val.status;
          obj.currency = val.currency;
          obj.amount = val.amount;
          obj.updatedAt = new Date(val.updatedAt).toLocaleString();
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
  },
};
</script>
<style lang="scss" src="./style.scss" scoped>
</style>


