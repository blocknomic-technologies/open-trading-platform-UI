<template src="./template.html"></template>

<script>
import WalletService from '@/services/WalletService.js';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'wallet-summary-bitfinex',
  components: {
    Spinner,
  },
  data() {
    return {
      bitfinexSummary: [],
      initialData: [],
      loading: [],
      fromValue: [],
      toValue: [],
      amount: [],
      spinnerFlag: true,
      searchString: '',
      sortBy: 0,
    };
  },
  watch: {
    searchString: function() {
      this.updateData();
    },
  },
  async created() {
    this.creating();
  },
  methods: {
    async creating () {
      let data = await WalletService.bitfinexWalletSummary();
      if(data.data.error) {
        this.spinnerFlag = false;
        this.initialData = [];
        this.$showErrorMsg({
          message: 'Notice: Invalid API-KEY or API-KEYS not Entered.',
        });
      } else {
        this.spinnerFlag = false;
        this.initialData = this.sortingData(data.data);
        this.updateData();    
      }
    },
    sortingData(data) {
      let newData = [];
      let bitfinexWalletData = data;
      let parsedData = [];
      bitfinexWalletData.forEach(element => {
        let obj = {
          wallet_type: '',
          currency: '',
          total_bal: '',
          unsettled_interest: '',
          available_bal: '',
        };
        obj.wallet_type = element[0];
        obj.currency = element[1];
        obj.total_bal = parseFloat(element[2]);
        obj.unsettled_interest = parseFloat(element[3]);
        obj.available_bal = parseFloat(element[4]) || parseFloat(0);
        parsedData.push(obj);
      });
      let i;
      for (i = 0; i < parsedData.length; i++) {
        this.fromValue[i] = 'From';
        this.toValue[i] = 'To';
        let index = newData.findIndex((elem) => {
          return elem.currency === parsedData[i].currency;
        });
        if(index >= 0) {
          if(parsedData[i].wallet_type === 'exchange') {
            newData[index].exchange_total_balance = parseFloat(parsedData[i].total_bal);
            newData[index].exchange_unsettled_interest = parseFloat(parsedData[i].unsettled_interest);
            newData[index].exchange_available_balance = parseFloat(parsedData[i].available_bal);
            newData[index].total_balance = parseFloat(parseFloat(parsedData[i].total_bal) + newData[index].margin_total_balance + newData[index].funding_total_balance);
          } else if (parsedData[i].wallet_type === 'margin') {
            newData[index].margin_total_balance = parseFloat(parsedData[i].total_bal);
            newData[index].margin_unsettled_interest = parseFloat(parsedData[i].unsettled_interest);
            newData[index].margin_available_balance = parseFloat(parsedData[i].available_bal);
            newData[index].total_balance = parseFloat(parseFloat(parsedData[i].total_bal) + newData[index].exchange_total_balance + newData[index].funding_total_balance);
          } else {
            newData[index].funding_total_balance = parseFloat(parsedData[i].total_bal);
            newData[index].funding_unsettled_interest = parseFloat(parsedData[i].unsettled_interest);
            newData[index].funding_available_balance = parseFloat(parsedData[i].available_bal);
            newData[index].total_balance = parseFloat(parseFloat(parsedData[i].total_bal)+ newData[index].margin_total_balance + newData[index].exchange_total_balance);
          }
        } else {
          if(parsedData[i].wallet_type === 'exchange') {
            let obj = {};
            obj.currency = parsedData[i].currency;
            obj.exchange_total_balance = parseFloat(parsedData[i].total_bal);
            obj.exchange_unsettled_interest = parseFloat(parsedData[i].unsettled_interest);
            obj.exchange_available_balance = parseFloat(parsedData[i].available_bal);
            obj.funding_total_balance = 0;
            obj.funding_unsettled_interest = 0;
            obj.funding_available_balance = 0;
            obj.margin_total_balance = 0;
            obj.margin_unsettled_interest = 0;
            obj.margin_available_balance = 0;
            obj.total_balance = parseFloat((parsedData[i].total_bal));
            newData.push(obj);
          } else if (parsedData[i].wallet_type === 'margin') {
            let obj = {};
            obj.currency = parsedData[i].currency;
            obj.exchange_total_balance = 0;
            obj.exchange_unsettled_interest = 0;
            obj.exchange_available_balance = 0;
            obj.funding_total_balance = 0;
            obj.funding_unsettled_interest = 0;
            obj.funding_available_balance = 0;
            obj.margin_total_balance = parseFloat(parsedData[i].total_bal);
            obj.margin_unsettled_interest = parseFloat(parsedData[i].unsettled_interest);
            obj.margin_available_balance = parseFloat(parsedData[i].available_bal);
            obj.total_balance = parseFloat(parsedData[i].total_bal);
            newData.push(obj);
          } else {
            let obj = {};
            obj.currency = parsedData[i].currency;
            obj.exchange_total_balance = 0;
            obj.exchange_unsettled_interest = 0;
            obj.exchange_available_balance = 0;
            obj.funding_total_balance = parseFloat(parsedData[i].total_bal);
            obj.funding_unsettled_interest = parseFloat(parsedData[i].unsettled_interest);
            obj.funding_available_balance = parseFloat(parsedData[i].available_bal);
            obj.margin_total_balance = 0;
            obj.margin_unsettled_interest = 0;
            obj.margin_available_balance = 0;
            obj.total_balance = parseFloat(parsedData[i].total_bal);
            newData.push(obj);
          }
        }
      }
      return newData;
    },
    loadingToTrue(index) {
      this.$set(this.loading,index,true);
    },
    loadingToFalse(index) {
      this.$set(this.loading,index,false);
    },
    quickTransferMoney(index) {
      this.loadingToTrue(index);
      if(this.amount[index] === undefined && this.toValue[index] === 'To' && this.fromValue[index] === 'From') {
        this.loadingToFalse(index);
        this.$showErrorMsg({
          message: 'Check Inputs',
        });
      } else {
        let obj = {};
        obj.amount = this.amount[index];
        obj.currency = this.bitfinexSummary[index].currency;
        obj.walletfrom = this.fromValue[index].toLowerCase();
        obj.walletto = this.toValue[index].toLowerCase();
        obj.exchange = 'bitfinex';
        WalletService.bitfinexWalletTransfer(obj).then(response => {
          if(response.data[0].status === 'success') {
            this.loadingToFalse(index);
            this.amount[index] = undefined;
            this.fromValue[index] = 'From';
            this.toValue[index] = 'To';
            WalletService.bitfinexRefreshWalletBalances().then(() => {
              this.creating();
            });
            this.$showSuccessMsg({
              message: `${response.data[0].message}. Balances will be Updated Shortly.`,
            });
          } else {
            this.loadingToFalse(index);
            this.$showErrorMsg({
              message: `${response.data[0].message}`,
            });
            this.amount[index] = undefined;
            this.fromValue[index] = 'From';
            this.toValue[index] = 'To';
            this.creating();
          }
        });
      }
      
    },
    changeFromValue(index,value) {
      this.$set(this.fromValue,index,value);
    },
    changeToValue(index,value) {
      this.$set(this.toValue,index,value);

    },
    updateData() {
      this.bitfinexSummary = this.initialData.filter((ele) => {
        return ele.currency.includes(this.searchString.toUpperCase());
      });
      this.bitfinexSummary = this.sortData(this.bitfinexSummary);
    },
    sortData(data) {
      switch(this.sortBy) {
        case 0: 
          return data.reverse();
        case 1: 
          return data;
        case 101: 
          return data.sort((b,a) => {
            return a.exchange_total_balance - b.exchange_total_balance;
          });
        case 102: 
          return data.sort((b,a) => {
            return b.exchange_total_balance - a.exchange_total_balance;
          });
        case 201: 
          return data.sort((b,a) => {
            return a.margin_total_balance - b.margin_total_balance;
          });
        case 202: 
          return data.sort((b,a) => {
            return b.margin_total_balance - a.margin_total_balance;
          });
        case 301: 
          return data.sort((b,a) => {
            return a.funding_total_balance - b.funding_total_balance;
          });
        case 302: 
          return data.sort((b,a) => {
            return b.funding_total_balance - a.funding_total_balance;
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


