<template src="./template.html"></template>

<script>
import HistoryService from '@/services/HistoryService.js';
// import { dateToDisplayDateTime, } from '@/utils/utility';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'bequant-deposit-history',
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
        if(val.type === 'payin') {
          obj.id = val.id;
          obj.index = val.index;
          obj.status = val.status.toLowerCase();
          obj.currency = val.currency;
          obj.amount = val.amount;
          obj.updatedAt = new Date(val.updatedAt).toLocaleString();
          newData.push(obj);
        }
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
        return ele.id.includes(this.searchString.toLowerCase()) || ele.index.toString().includes(this.searchString) || ele.status.includes(this.searchString.toLowerCase()) || ele.currency.includes(this.searchString.toUpperCase());
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
            return a.index - b.index;
          });
        case 102: 
          return data.sort((b,a) => {
            return b.index - a.index;
          });
        case 201: 
          return data.sort((b,a) => {
            return a.status - b.status;
          });
        case 202: 
          return data.sort((b,a) => {
            return b.status - a.status;
          });
        case 301: 
          return data.sort((b,a) => {
            return a.amount - b.amount;
          });
        case 302: 
          return data.sort((b,a) => {
            return b.amount - a.amount;
          });
        case 401: 
          return data.sort((b,a) => {
            return a.currency - b.currency;
          });
        case 402: 
          return data.sort((b,a) => {
            return b.currency - a.currency;
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


