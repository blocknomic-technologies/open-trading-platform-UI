<template src="./template.html"></template>

<script>
import WalletService from '@/services/WalletService.js';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'bitmex-wallet-summary',
  components: {
    Spinner,
  },
  data() {
    return {
      bitmexSummary: [],
      spinnerFlag: true,
      sortBy: 0,
      searchString: '',
      initialData: [],
      displayText: '',
    };
  },
  watch: {
    searchString: function () {
      this.updateData();          
    },
  },
  async created() {
    let data = await WalletService.bitmexWalletSummary();
    let parsedData = [];
    if (data.data.error) {
      parsedData = JSON.parse(data.data);
      if(parsedData.data.error.name === 'HTTPError') {
        this.spinnerFlag = false;
        this.initialData = [];
        this.displayText = 'Invalid API-KEY or API-KEYS not Entered.';
        this.$showErrorMsg({
          message: 'Notice: Invalid API-KEY or API-KEYS not Entered.',
        });
      } else {
        this.spinnerFlag = false;
        this.initialData = [];
        this.displayText = `${parsedData.data.error.name}: ${parsedData.data.error.message}`;
        this.$showErrorMsg({
          message: `${parsedData.data.error.name}: ${parsedData.data.error.message}`,
        });
      }
    } else {
      data = JSON.parse(data.data);
      this.spinnerFlag = false;
      this.initialData = data;
      if(this.bitmexSummary.length === 0 && this.displayText !== 'Invalid API-KEY or API-KEYS not Entered.')
        this.displayText = 'No Records Found.';
      this.updateData();
    }
  },
  methods: {
    updateData() {
      this.bitmexSummary = this.initialData.filter((ele) => {
        return ele.symbol.includes(this.searchString.toUpperCase());
      });
      this.bitmexSummary = this.sortData(this.bitmexSummary);
    },
    sortData(data) {
      switch(this.sortBy) {
        case 0: 
          return data.reverse();
        case 1: 
          return data;
        case 201: 
          return data.sort((b,a) => {
            return parseFloat(a.free) - parseFloat(b.free);
          });
        case 202: 
          return data.sort((b,a) => {
            return parseFloat(b.free) - parseFloat(a.free);
          });
        case 301: 
          return data.sort((b,a) => {
            return (parseFloat(a.free) + parseFloat(a.locked)) - (parseFloat(b.free) + parseFloat(b.locked));
          });
        case 302: 
          return data.sort((b,a) => {
            return (parseFloat(b.free) + parseFloat(b.locked)) - (parseFloat(a.free) + parseFloat(a.locked));
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


