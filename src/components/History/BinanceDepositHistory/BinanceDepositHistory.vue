<template src="./template.html"></template>

<script>
import HistoryService from '@/services/HistoryService.js';
import { dateToDisplayDateTime, } from '@/utils/utility';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'binance-deposit-history',
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
    data = await HistoryService.binancedepositHistoryData('binance');
    // console.log(data);
    let parsedData = [];
    let newData = [];
    if(data.data.error) {
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
      parsedData = parsedData.depositList;
      parsedData.forEach((val, index) => {
        let obj = {};
        obj.id = index + 1;
        obj.amount = val.amount;
        if(val.status === 0)
          obj.status = 'Pending';
        else if(val.status === 1)
          obj.status = 'Success';
        obj.address = val.address;
        obj.asset = val.asset;
        obj.txId = val.txId;
        obj.insertTime = new Date(val.insertTime);
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
    copyReferral(id) {
      let copyText = document.querySelector(`#txhash${id}`);
      copyText.select();
      copyText.select();
      document.execCommand('copy');
      // alert("Copied the text: " + copyText.value);
      this.$showSuccessMsg({ message: 'Transaction Hash copied successfully.', });
    }, 
    updateData() {
      this.history = this.initialData.filter((ele) => {
        return ele.id.toString().includes(this.searchString) || ele.address.toLowerCase().includes(this.searchString.toLowerCase()) || ele.status.toLowerCase().includes(this.searchString.toLowerCase()) || ele.asset.includes(this.searchString.toUpperCase())|| ele.txId.toLowerCase().includes(this.searchString.toLowerCase()) ;
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
            return ('' + a.asset).localeCompare(b.asset);
          });
        case 102: 
          return data.sort((b,a) => {
            return ('' + b.asset).localeCompare(a.asset);
          });
        case 201: 
          return data.sort((b,a) => {
            return a.id - b.id;
          });
        case 202: 
          return data.sort((b,a) => {
            return b.id - a.id;
          });
        case 301: 
          return data.sort((b,a) => {
            return a.amount - b.amount;
          });
        case 302: 
          return data.sort((b,a) => {
            return b.amount - a.amount;
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


