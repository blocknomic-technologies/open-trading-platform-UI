<template src="./template.html"></template>

<script>
import HistoryService from '@/services/HistoryService.js';
import Spinner from '@/components/Spinner/Spinner.vue';
import { dateToDisplayDateTime, } from '@/utils/utility';

export default {
  name: 'bitfinex-orders-history',
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
    data = await HistoryService.bitfinexOrdersHistoryData('bitfinex');
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
        obj.symbol = val[3] || '-';
        obj.MTS_CREATE = val[4] || '-';
        obj.amount = val[6] || '-';
        obj.amount_orig = val[7] || '-';
        obj.type = val[8] || '-';
        obj.order_status = val[13] || '-';
        obj.price = val[16] || '-';
        obj.price_avg = val[17] || '-';
        obj.price_trailing = val[18] || '-';
        obj.price_aux_limit = val[19] || '-';
        obj.hidden = (val[23] !== null) ? 'Yes' : 'No';
        obj.notify = (val[24] !== null) ? 'Yes' : 'No';
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
        return ele.symbol.includes(this.searchString.toUpperCase()) || ele.type.toString().includes(this.searchString) || ele.id.toString().includes(this.searchString) ;
      });
      this.history = this.sortData(this.history);
      this.history = this.history.reverse();
    },
    sortData(data) {
      switch(this.sortBy) {
        case 0: 
          return data.reverse();
        case 1: 
          return data;
        case 101: 
          return data.sort((b,a) => {
            return a.order_status - b.order_status;
          });
        case 102: 
          return data.sort((b,a) => {
            return b.order_status - a.order_status;
          });
        case 201: 
          return data.sort((b,a) => {
            return a.symbol - b.symbol;
          });
        case 202: 
          return data.sort((b,a) => {
            return b.symbol - a.symbol;
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
            return a.price - b.price;
          });
        case 402: 
          return data.sort((b,a) => {
            return b.price - a.price;
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


