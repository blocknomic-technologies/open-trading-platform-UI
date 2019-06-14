<template src="./template.html"></template>

<script>
import WalletService from '@/services/WalletService.js';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'wallet-summary-binance',
  components: {
    Spinner,
  },
  data() {
    return {
      binanceSummary: [],
      spinnerFlag: true,
      sortBy: 0,
      searchString: '',
      initialData: [],
    };
  },
  watch: {
    searchString: function () {
      this.updateData();          
    },
  },
  async created() {
    let data = await WalletService.binanceWalletSummary();
    if(data.data.error) {
      this.spinnerFlag = false;
      this.initialData = [];
      this.$showErrorMsg({
        message: 'Notice: Invalid API-KEY or API-KEYS not Entered.',
      });
    } else {
      data = JSON.parse(data.data);
      data = data.balances;
      this.spinnerFlag = false;
      this.initialData = data;
      this.updateData();
    }
  },
  methods: {
    updateData() {
      this.binanceSummary = this.initialData.filter((ele) => {
        return ele.asset.includes(this.searchString.toUpperCase());
      });
      this.binanceSummary = this.sortData(this.binanceSummary);
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


