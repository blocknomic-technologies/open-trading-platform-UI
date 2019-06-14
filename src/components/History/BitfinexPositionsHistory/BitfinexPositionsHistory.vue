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
    data = await HistoryService.bitfinexPositionsHistoryData();
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
        obj.SYMBOL = val[0] || '-';
        obj.STATUS = val[1] || '-';
        obj.AMOUNT = val[2] || '-';
        obj.BASE_PRICE = val[3] || '-';
        obj.MARGIN_FUNDING = val[4] || '-';
        obj.MARGIN_FUNDING_TYPE = val[5] || '-';
        obj.PL = val[6] || '-';
        obj.PL_PERC = val[7] || '-';
        obj.PRICE_LIQ = val[8] || '-';
        obj.LEVERAGE = val[9] || '-';
        obj.ID = val[11] || '-';
        obj.MTSCREATE = val[12] || '-';
        obj.MTSUPDATE = val[13] || '-';
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
        return ele.SYMBOL.includes(this.searchString.toUpperCase()) || ele.PL.toString().includes(this.searchString) || ele.ID.toString().includes(this.searchString) ;
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
            return a.STATUS - b.STATUS;
          });
        case 102: 
          return data.sort((b,a) => {
            return b.STATUS - a.STATUS;
          });
        case 201: 
          return data.sort((b,a) => {
            return a.AMOUNT - b.AMOUNT;
          });
        case 202: 
          return data.sort((b,a) => {
            return b.AMOUNT - a.AMOUNT;
          });
        case 301: 
          return data.sort((b,a) => {
            return a.PL_PERC - b.PL_PERC;
          });
        case 302: 
          return data.sort((b,a) => {
            return b.PL_PERC - a.PL_PERC;
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


