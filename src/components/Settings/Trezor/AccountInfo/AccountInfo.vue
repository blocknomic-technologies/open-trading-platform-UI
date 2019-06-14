<template src="./template.html"> 
</template>

<script>
import TrezorService from '@/services/TrezorService.js';


export default {
  name: 'account-info',
  data() {
    return {
      selectedCurrency: 'SELECT A CURRENCY',
      displayFlag: true,
      normalPath: '',
      accountNumber: '',
      currencyArray: [{key: 'btc', value: 'Bitcoin',}, {key: 'bch', value: 'Bitcoin Cash',}, {key: 'btg', value: 'Bitcoin Gold',}, {key: 'ltc', value: 'Litecoin',}, {key: 'dash', value: 'Dash',}, {key: 'zcash', value: 'Zcash',}, {key: 'test', value: 'Testnet',}, {key: 'doge', value: 'Dogecoin',}, {key: 'vtc', value: 'Vertcoin',},],
      result: {
        id: '',
        path: [],
        serializedPath: '',
        xpub: '',
        address: '',
        addressIndex: '',
        addressPath: [],
        addressSerializedPath: '',
        balance: '',
        confirmed: '',
      },
    };
  },
  methods: {
    changeSelectedCurrency(key) {
      this.selectedCurrency = key;
    },
    async handleSubmit() {
      let accountInfo = await TrezorService.getAccountInfoUsingPath(this.normalCurrencyPath(this.selectedCurrency, this.accountNumber-1), this.selectedCurrency, false);
      if(accountInfo.success) {
        // console.log(accountInfo.payload);
        this.displayFlag = false;
        this.result.id = accountInfo.payload.id;
        this.result.path = accountInfo.payload.path;
        this.result.serializedPath = accountInfo.payload.serializedPath;
        this.result.xpub = accountInfo.payload.xpub;
        this.result.address = accountInfo.payload.address;
        this.result.addressIndex = accountInfo.payload.addressIndex;
        this.result.addressPath = accountInfo.payload.addressPath;
        this.result.addressSerializedPath = accountInfo.payload.addressSerializedPath;
        this.result.balance = accountInfo.payload.balance;
        this.result.confirmed = accountInfo.payload.confirmed;
      }
      else {
        this.$showErrorMsg({
          message: `${accountInfo.payload.error}`,
        });
        this.selectedCurrency = 'SELECT A CURRENCY';
        this.accountNumber = '';
      }
    },
    goBack () {
      this.displayFlag = true;
      this.selectedCurrency = 'SELECT A CURRENCY';
      this.accountNumber = '';
      this.result = {
        id: '',
        path: [],
        serializedPath: '',
        xpub: '',
        address: '',
        addressIndex: '',
        addressPath: [],
        addressSerializedPath: [],
        balance: '',
        confirmed: '',
      };
    },
    normalCurrencyPath(currency, account) {
      let coinArray = [{
        coin: 'Bitcoin',
        path: `m/49'/0'/${account}'`,
        symbol: 'btc',
      },
                       {
                         coin: 'Bitcoin Cash',
                         path: `m/44'/145'/${account}'`,
                         symbol: 'bch',
                       },
                       {
                         coin: 'Bitcoin Gold',
                         path: `m/44'/156'/${account}'`,
                         symbol: 'btg',
                       },
                       {
                         coin: 'Litecoin',
                         path: `m/49'/2'/${account}'`,
                         symbol: 'ltc',
                       },
                       {
                         coin: 'Dash',
                         path: `m/44'/5'/${account}'`,
                         symbol: 'dash',
                       },
                       {
                         coin: 'Zcash',
                         path: `m/44'/133'/${account}'`,
                         symbol: 'zcash',
                       },
                       {
                         coin: 'Testnet',
                         path: `m/49'/1'/${account}'`,
                         symbol: 'test',
                       },
                       {
                         coin: 'Dogecoin',
                         path: `m/44'/3'/${account}'`,
                         symbol: 'doge',
                       },
                       {
                         coin: 'Vertcoin',
                         path: `m/44'/28'/${account}'`,
                         symbol: 'vtc',
                       },
      ];
      let index = coinArray.findIndex((elem) => {
        return elem.symbol === currency;
      });
      return coinArray[index].path;
    },
  },
};
</script>
<style src="./style.scss" lang="scss" scoped>

</style>
