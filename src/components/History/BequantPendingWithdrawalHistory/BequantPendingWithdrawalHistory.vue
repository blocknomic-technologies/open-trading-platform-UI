<template src="./template.html"></template>

<script>
import HistoryService from '@/services/HistoryService.js';
// import { dateToDisplayDateTime, } from '@/utils/utility';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'bequant-pending-withdrawal-history',
  components: {
    Spinner,
  },
  data() {
    return {
      history: [],
      spinnerFlag: true,
      sortBy: 0,
      searchString: '',
      initialData: [],
      displayText: 'No Records Found.',
    };
  },
  async created() {
    let data = [];
    data = await HistoryService.bequantTransactionHistoryData('bequant');
    let newData = [];
    let parsedData = [];
    if(data.data.error) {
      this.spinnerFlag = false;
      this.initialData = [];
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
        // if(val.type === 'payout' && val.status !== 'success') {
        obj.id = val.id;
        obj.index = val.index;
        obj.status = val.status;
        obj.currency = val.currency;
        obj.amount = val.amount;
        obj.updatedAt = new Date(val.updatedAt).toLocaleString();
        newData.push(obj);
        // }
      });
    }
    this.initialData = newData;
    if(this.history.length === 0 && this.displayText !== 'Invalid API-KEY or API-KEYS not Entered.')
      this.displayText = 'No Records Found.';
    this.updateData();
  },
  watch: {
    searchString: function() {
      this.updateData();
    },
  },
  methods: {
    updateData() {
      this.history = this.initialData.filter((ele) => {
        return ele.currency.includes(this.searchString.toUpperCase()) || ele.index.toString().includes(this.searchString) || ele.id.toString().includes(this.searchString) || ele.status.includes(this.searchString)  ;
      });
      this.history = this.sortData(this.history);
    },
    sortData(data) {
      switch(this.sortBy) {
        case 0: 
          return data.reverse();
        case 1: 
          return data;
        case 101: 
          return data.sort((b,a) => {
            return a.id - b.id;
          });
        case 102: 
          return data.sort((b,a) => {
            return b.id - a.id;
          });
        case 201: 
          return data.sort((b,a) => {
            return a.index - b.index;
          });
        case 202: 
          return data.sort((b,a) => {
            return b.index - a.index;
          });
        case 301: 
          return data.sort((a,b) => {
            return a.currency - b.currency;
          });
        case 302: 
          return data.sort((a,b) => {
            return b.currency - a.currency;
          });
        case 401: 
          return data.sort((b,a) => {
            return a.amount - b.amount;
          });
        case 402: 
          return data.sort((b,a) => {
            return b.amount - a.amount;
          });
      }
    },
    sortDataBy(value) {
      if(this.sortBy === value) {
        this.sortBy += 1;
      } else {
        this.sortBy = value;
      }
      this.updateData();
    },
  },
};
</script>
<style lang="scss" src="./style.scss" scoped>
</style>


