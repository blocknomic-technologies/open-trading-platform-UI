<template src="./template.html"></template>

<script>
import WalletService from '@/services/WalletService.js';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'wallet-summary-bequant',
  components: {
    Spinner,
  },
  data() {
    return {
      bequantSummary: [],
      trading: [false,],
      loading: [],
      amount: [],
      spinnerFlag: true,
      initialData: [],
      sortBy: 0,
      searchString: '',
      fromValue: [],
      toValue: [],
    };
  },
  watch: {
    searchString: function() {
      this.updateData();
    },
  },
  async created() {
    // this.loading[0] =true;
    this.creating();
    
  },
  methods: {
    async creating() {
      let tradingWalletData = await WalletService.bequantTradingWalletSummary('bequant');
      let mainWalletData = await WalletService.bequantMainWalletSummary('bequant');
      if(tradingWalletData.data.error || mainWalletData.data.error) {
        this.spinnerFlag = false;
        this.initialData = [];
        this.$showErrorMsg({
          message: 'Notice: Invalid API-KEY or API-KEYS not Entered.',
        });
      }
      else {
       
        let parsedTradingData = JSON.parse(tradingWalletData.data);
        let parsedMainData = JSON.parse(mainWalletData.data);
        if(tradingWalletData.status && mainWalletData.status) {
          this.spinnerFlag = false;
          this.initialData = this.sortingData(parsedTradingData, parsedMainData);
          this.updateData();
        }
      }
    },
    sortingData(tradingWallet, mainAccountWallet) {
      let newData = [];
      let i;
      for(i = 0; i < tradingWallet.length; i++) {
        let obj = {};
        obj.currency = tradingWallet[i].currency;
        obj.trading_total_balance = parseFloat(parseFloat(tradingWallet[i].reserved) + parseFloat(tradingWallet[i].available));
        obj.trading_unsettled_interest = parseFloat(tradingWallet[i].reserved);
        obj.trading_available_balance = parseFloat(tradingWallet[i].available);
        obj.main_total_balance = 0;
        obj.main_unsettled_interest = 0;
        obj.main_available_balance = 0;
        obj.total_balance = parseFloat(parseFloat(tradingWallet[i].reserved) + parseFloat(tradingWallet[i].available));
        newData.push(obj);
      }
      for (i = 0; i < mainAccountWallet.length; i++) {
        this.fromValue[i] = 'From';
        this.toValue[i] = 'To';
        let index = newData.findIndex((elem) => {
          return elem.currency === mainAccountWallet[i].currency;
        });
        if(index >= 0) {
          newData[index].main_total_balance = parseFloat(parseFloat(mainAccountWallet[i].reserved) + parseFloat(mainAccountWallet[i].available));
          newData[index].main_unsettled_interest = parseFloat(mainAccountWallet[i].reserved);
          newData[index].main_available_balance = parseFloat(mainAccountWallet[i].available);
          newData[index].total_balance += parseFloat(parseFloat(mainAccountWallet[i].reserved) + parseFloat(mainAccountWallet[i].available));
        } else {
          let obj = {};
          obj.currency = mainAccountWallet[i].currency;
          obj.trading_total_balance = 0;
          obj.trading_unsettled_interest = 0;
          obj.trading_available_balance = 0;
          obj.main_total_balance = parseFloat(parseFloat(mainAccountWallet[i].reserved) + parseFloat(mainAccountWallet[i].available));
          obj.main_unsettled_interest = parseFloat(mainAccountWallet[i].reserved);
          obj.main_available_balance = parseFloat(mainAccountWallet[i].available);
          obj.total_balance = parseFloat(parseFloat(mainAccountWallet[i].reserved) + parseFloat(mainAccountWallet[i].available));
          newData.push(obj);    
        }
      }
      return newData;
    },
    changeFromValue(index,value) {
      this.$set(this.fromValue,index,value);
    },
    changeToValue(index,value) {
      this.$set(this.toValue,index,value);
    },
    loadingToTrue(index) {
      this.$set(this.loading, index, true);
    },
    loadingToFalse(index) {
      this.$set(this.loading, index, false);
    },
    quickTransferMoney(index) {
      this.loadingToTrue(index);
      let obj = {};
      obj.amount = this.amount[index];
      obj.currency = this.bequantSummary[index].currency;
      if(this.toValue[index] === 'Trading' && this.fromValue[index] === 'Main') {
        obj.walletto = 'bankToExchange';
      } else if(this.toValue[index] === 'Main' && this.fromValue[index] === 'Trading') {
        obj.walletto = 'exchangeToBank';
      } else {
        this.loadingToFalse(index);
        this.$showErrorMsg({
          message: 'Cannot Transfer Between Similar Wallet Types',
        });
        this.amount[index] = '';
        this.fromValue[index] = 'From';
        this.toValue[index] = 'To';
      }
      if(obj.amount === undefined && this.toValue[index] === 'To' && this.fromValue[index] === 'From') {
        this.loadingToFalse(index);
        this.$showErrorMsg({
          message: 'Check Inputs',
        });
      } else {
        WalletService.bequantWalletTransfer(obj).then(response => {
          if(response.data.error) {
            this.loadingToFalse(index);
            let parsedData = JSON.parse(response.data.error);
            this.$showErrorMsg({
              message: `Error Code: ${parsedData.error.code} Message: ${parsedData.error.message}`,
            });
            this.amount[index] = '';
            this.fromValue[index] = 'From';
            this.toValue[index] = 'To';
          }
          else {
            this.loadingToFalse(index);
            let parsedRes = JSON.parse(response.data);
            this.$showSuccessMsg({
              message: `ID: ${parsedRes.id}. Funds Transferred Successfully`,
            });
            this.amount[index] = '';
            this.fromValue[index] = 'From';
            this.toValue[index] = 'To';
            this.creating();
          }
        });
      }
    },
    updateData() {
      this.bequantSummary = this.initialData.filter((ele) => {
        return ele.currency.includes(this.searchString.toUpperCase());
      });
      this.bequantSummary = this.sortData(this.bequantSummary);
    },
    sortData(data) {
      switch(this.sortBy) {
        case 0: 
          return data.reverse();
        case 1: 
          return data;
        case 201: 
          return data.sort((a,b) => {
            return b.trading_total_balance - a.trading_total_balance;
          });
        case 202: 
          return data.sort((a,b) => {
            return a.trading_total_balance - b.trading_total_balance;
          });
        case 301: 
          return data.sort((a,b) => {
            return b.main_total_balance - a.main_total_balance;
          });
        case 302: 
          return data.sort((a,b) => {
            return a.main_total_balance - b.main_total_balance;
          });
        case 401: 
          return data.sort((b,a) => {
            return a.total_balance - b.total_balance;
          });
        case 402: 
          return data.sort((b,a) => {
            return b.total_balance - a.total_balance;
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


