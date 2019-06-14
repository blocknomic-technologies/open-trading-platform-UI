<template src="./template.html"></template>

<script>
import WalletService from '@/services/WalletService.js';
import Spinner from '@/components/Spinner/Spinner.vue';
// import { dateToDisplayDateTime, } from '@/utils/utility';

export default {
  name: 'bitmex-wallet-summary',
  components: {
    Spinner,
  },
  data() {
    return {
      bitmexSummary: [],
      spinnerFlag: true,
      displayText: '',
    };
  },
  watch: {
    searchString: function () {
      this.updateData();          
    },
  },
  async created() {
    let data = await WalletService.bitmexWalletDetails();
    let parsedData = [];
    if (data.data.error) {
      parsedData = JSON.parse(data.data);
      if(parsedData.data.error.name === 'HTTPError') {
        this.spinnerFlag = false;
        this.bitmexSummary = [];
        this.displayText = 'Invalid API-KEY or API-KEYS not Entered.';
        this.$showErrorMsg({
          message: 'Notice: Invalid API-KEY or API-KEYS not Entered.',
        });
      } else {
        this.spinnerFlag = false;
        this.bitmexSummary = [];
        this.displayText = `${parsedData.data.error.name}: ${parsedData.data.error.message}`;
        this.$showErrorMsg({
          message: `${parsedData.data.error.name}: ${parsedData.data.error.message}`,
        });
      }
    } else {
      data = JSON.parse(data.data);
      this.spinnerFlag = false;
      this.bitmexSummary = data;
      if(this.bitmexSummary.length === 0 && this.displayText !== 'Invalid API-KEY or API-KEYS not Entered.')
        this.displayText = 'No Records Found.';
      this.updateData();
    }
  },
  methods: {
    formatDateTime(timestamp) {
      return (new Date(timestamp).toLocaleString());
    },
  },
};
</script>
<style lang="scss" src="./style.scss" scoped>
</style>


