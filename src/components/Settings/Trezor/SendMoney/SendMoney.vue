<template src="./template.html"></template>

<script>
import TrezorService from '@/services/TrezorService.js';

export default {
  name: 'send-money',
  components: {},
  data() {
    return {
      selectedCurrency: 'SELECT A CURRENCY',
      displayFlag: true,
      address: '',
      amount: 0,
      currencyArray: [{key: 'btc', value: 'Bitcoin',}, {key: 'bch', value: 'Bitcoin Cash',}, {key: 'btg', value: 'Bitcoin Gold',}, {key: 'ltc', value: 'Litecoin',}, {key: 'dash', value: 'Dash',}, {key: 'zcash', value: 'Zcash',}, {key: 'test', value: 'Testnet',}, {key: 'doge', value: 'Dogecoin',}, {key: 'vtc', value: 'Vertcoin',},],
      result: {
        signatures: [],
        serializedTx: '',
        txid: '',
      },
      routes: [
        {
          amount: '',
          address: '',
        },
      ],
    };
  },
  mounted() {
  },
  methods: {
    goBack () {
      this.displayFlag = true;
      this.selectedCurrency = 'SELECT A CURRENCY';
      this.address = '';
      this.amount = '';
      this.result = {
        signatures: [],
        serializedTx: '',
        txid: '',
      };
    },
    changeSelectedCurrency(key) {
      this.selectedCurrency = key;
    },
    addNewForm() {
      this.routes.push({
        amount: '',
        address: '',
      });
    },
    deleteKey(index) {
      this.routes.splice(index, 1);
    },

    async handleSubmit() {
      try{
        let response = await TrezorService.composeTransaction(this.routes, this.selectedCurrency, true);
        if(response.success) {
          this.displayFlag = false;
          this.result.txid = response.payload.txid;
          this.result.signatures = response.payload.signatures;
          this.result.serializedTx = response.payload.serializedTx;
        }
        else {
          this.selectedCurrency= 'SELECT A CURRENCY';
          this.routes = [{amount: '', address: '',},];
          this.$showErrorMsg({
            message: `${response.payload.error}`,
          });
        }
      }catch(err){
        this.$showErrorMsg({
          message: 'OOPS .... There was an Error',
        });
        return err;
      }
    },
  },
};
</script>

<style lang="scss" src="./style.scss" scoped></style>
