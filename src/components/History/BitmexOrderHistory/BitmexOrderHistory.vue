<template src="./template.html"></template>

<script>
import HistoryService from '@/services/HistoryService.js';
import Spinner from '@/components/Spinner/Spinner.vue';
import { dateToDisplayDateTime, } from '@/utils/utility';

export default {
  name: 'bitmex-order-history',
  components: {
    Spinner,
  },
  data() {
    return {
      history: [],
      spinnerFlag: true,
      sortBy: 302,
      searchString: '',
      initialData: [],
      displayText: 'No Records Found.',
    };
  },
  async created() {
    let data = [];
    data = await HistoryService.bitmexOrderHistory();
    let parsedData = [];
    let newData = [];
    if (data.data.error) {
      parsedData = JSON.parse(data.data);
      if(parsedData.data.error.name === 'HTTPError') {
        this.spinnerFlag = false;
        this.initialData = [];
        this.history = [];
        this.displayText = 'Invalid API-KEY or API-KEYS not Entered.';
        this.$showErrorMsg({
          message: 'Notice: Invalid API-KEY or API-KEYS not Entered.',
        });
      } else {
        this.spinnerFlag = false;
        this.initialData = [];
        this.history = [];
        this.displayText = `${parsedData.data.error.name}: ${parsedData.data.error.message}`;
        this.$showErrorMsg({
          message: `${parsedData.data.error.name}: ${parsedData.data.error.message}`,
        });
      }
    } else {
      this.spinnerFlag = false;
      parsedData = JSON.parse(data.data);
      parsedData.forEach((val) => {
        let obj = {};
        obj.orderID = val.orderID || '-';
        obj.clOrdID = val.clOrdID || '-';
        obj.account = val.account || '-';
        obj.symbol = val.symbol || '-';
        obj.side = val.side || '-';
        obj.orderQty = val.orderQty || '-';
        obj.price = val.price || '-';
        obj.displayQty = val.displayQty || '-';
        obj.stopPx = val.stopPx || '-';
        obj.pegOffsetValue = val.pegOffsetValue || '-';
        obj.pegPriceType = val.pegPriceType || '-';
        obj.currency = val.currency || '-';
        obj.settlCurrency = val.settlCurrency || '-';
        obj.ordType = val.ordType || '-';
        obj.timeInForce = val.timeInForce || '-';
        obj.execInst = val.execInst || '-';
        obj.contingencyType = val.contingencyType || '-';
        obj.exDestination = val.exDestination || '-';
        obj.ordStatus = val.ordStatus || '-';
        obj.triggered = val.triggered || '-';
        obj.workingIndicator = val.workingIndicator || '-';
        obj.ordRejReason = val.ordRejReason || '-';
        obj.simpleLeavesQty = val.simpleLeavesQty || '-';
        obj.leavesQty = val.leavesQty || '-';
        obj.simpleCumQty = val.simpleCumQty || '-';
        obj.cumQty = val.cumQty || '-';
        obj.avgPx = val.avgPx || '-';
        obj.multiLegReportingType = val.multiLegReportingType || '-';
        obj.text = val.text || '-';
        obj.transactTime = new Date(val.transactTime).toLocaleString() || '-';
        obj.timestamp = new Date(val.timestamp).toLocaleString() || '-';
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
        return ele.symbol.includes(this.searchString.toUpperCase());
      });
      this.history = this.sortData(this.history);
    },
    sortData(data) {
      switch(this.sortBy) {
        case 0: 
          return data.sort((b,a) => {
            return ('' + a.symbol).localeCompare(b.symbol);
          });
        case 1: 
          return data.sort((b,a) => {
            return ('' + b.symbol).localeCompare(a.symbol);
          });
        case 101: 
          return data.sort((b,a) => {
            return ('' + a.side).localeCompare(b.side);
          });
        case 102: 
          return data.sort((b,a) => {
            return ('' + b.side).localeCompare(a.side);
          });
        case 201: 
          return data.sort((b,a) => {
            return a.price - b.price;
          });
        case 202: 
          return data.sort((b,a) => {
            return b.price - a.price;
          });
        case 301: 
          return data.reverse();
        case 302: 
          return data;
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


