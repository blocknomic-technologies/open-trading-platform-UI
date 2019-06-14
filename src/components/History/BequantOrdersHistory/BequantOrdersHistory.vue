<template src="./template.html"></template>

<script>
import HistoryService from '@/services/HistoryService.js';
// import { dateToDisplayDateTime, } from '@/utils/utility';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'bequant-orders-history',
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
    data = await HistoryService.bequantOrdersHistoryData('bequant');
    let newData = [];
    let parsedData = [];
    if(data.data.error){
      this.spinnerFlag = false;
      this.initialData = [];
      this.history = [];
      this.displayText = 'Invalid API-KEY or API-KEYS not Entered.';
      this.$showErrorMsg({
        message: 'Notice: Invalid API-KEY or API-KEYS not Entered.',
      });
    } else {
      this.spinnerFlag = false;
      parsedData = JSON.parse(data.data);
      parsedData.forEach((val) => {
        let obj = {};
        obj.clientOrderId = val.clientOrderId;
        obj.createdAt = new Date(val.createdAt).toLocaleString();
        obj.cumQuantity = val.cumQuantity;
        obj.id = val.id;
        obj.price = val.price;
        obj.quantity = val.quantity;
        obj.side = val.side;
        obj.status = val.status;
        obj.symbol = val.symbol;
        obj.timeInForce = val.timeInForce;
        obj.type = val.type;
        obj.updatedAt = new Date(val.updatedAt).toLocaleString();
        newData.push(obj);
      });
    }
    // console.log(newData);
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
        return ele.symbol.includes(this.searchString.toUpperCase()) || ele.symbol.toString().includes(this.searchString) || ele.clientOrderId.toString().includes(this.searchString) ;
      });
      this.history = this.sortData(this.history);
    },
    sortData(data) {
      switch(this.sortBy) {
        case 0: 
          return data.sort((b,a) => {
            return a.id - b.id;
          });
        case 1: 
          return data.sort((b,a) => {
            return b.id - a.id;
          });
        case 101: 
          return data.sort((b,a) => {
            return ('' + a.symbol).localeCompare(b.symbol);
          });
        case 102: 
          return data.sort((b,a) => {
            return ('' + b.symbol).localeCompare(a.symbol);
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
          return data.sort((b,a) => {
            return a.quantity - b.quantity;
          });
        case 302: 
          return data.sort((b,a) => {
            return b.quantity - a.quantity;
          });
        case 401: 
          return data.sort((b,a) => {
            return ('' + a.type).localeCompare(b.type);
          });
        case 402: 
          return data.sort((b,a) => {
            return ('' + b.type).localeCompare(a.type);
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


