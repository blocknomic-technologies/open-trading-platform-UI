<template src="./template.html"></template>

<script>
import HistoryService from '@/services/HistoryService.js';
import Spinner from '@/components/Spinner/Spinner.vue';
import { dateToDisplayDateTime, } from '@/utils/utility';

export default {
  name: 'bitfinex-trading-history',
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
    data = await HistoryService.bitfinexTradingHistoryData('bitfinex');
    let newData = [];
    if (data.data.error) {
      this.spinnerFlag = false;
      this.initialData = [];
      this.history = [];
      this.displayText = 'Invalid API-KEY or API-KEYS not Entered.';
      this.$showErrorMsg({
        message: 'Notice: Invalid API-KEY or API-KEYS not Entered.',
      });
    } else {
      this.spinnerFlag = false;
      data.data.forEach((val) => {
        let obj = {};
        obj.id = val[0] || '-';
        obj.Pair = val[1] || '-';
        obj.MTS_CREATE = val[2] || '-';
        obj.ORDER_ID = val[3] || '-';
        obj.EXEC_AMOUNT = val[4] || '-';
        obj.EXEC_PRICE = val[5] || '-';
        obj.ORDER_TYPE = val[6] || '-';
        obj.ORDER_PRICE = val[7] || '-';
        obj.MAKER = val[8] || '-';
        obj.FEE = val[9] || '-';
        obj.FEE_CURRENCY = val[10] || '-';
        newData.push(obj);
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
    formatDateTime(timestamp) {
      return dateToDisplayDateTime(new Date(timestamp));
    },
    updateData() {
      this.history = this.initialData.filter((ele) => {
        return ele.Pair.includes(this.searchString.toUpperCase()) || ele.ORDER_ID.toString().includes(this.searchString) || ele.id.toString().includes(this.searchString) ;
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
            return a.ORDER_PRICE - b.ORDER_PRICE;
          });
        case 102: 
          return data.sort((b,a) => {
            return b.ORDER_PRICE - a.ORDER_PRICE;
          });
        case 201: 
          return data.sort((b,a) => {
            return a.EXEC_AMOUNT - b.EXEC_AMOUNT;
          });
        case 202: 
          return data.sort((b,a) => {
            return b.EXEC_AMOUNT - a.EXEC_AMOUNT;
          });
        case 301: 
          return data.sort((b,a) => {
            return a.EXEC_PRICE - b.EXEC_PRICE;
          });
        case 302: 
          return data.sort((b,a) => {
            return b.EXEC_PRICE - a.EXEC_PRICE;
          });
        // case 301: 
        //   return data.sort((b,a) => {
        //     return a.MTS_CREATE - b.MTS_CREATE;
        //   });
        // case 302: 
        //   return data.sort((b,a) => {
        //     return b.MTS_CREATE - a.MTS_CREATE;
        //   });
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


