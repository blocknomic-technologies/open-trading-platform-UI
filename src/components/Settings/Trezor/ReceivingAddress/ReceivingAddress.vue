<template src="./template.html"> 
</template>

<script>
import TrezorService from '@/services/TrezorService.js';


export default {
  name: 'receiving-address',
  data() {
    return {
      selectedCurrency: 'SELECT A CURRENCY',
      displayFlag: true,
      normalPath: '',
      accountNumber: '',
      pathNumber: '',
      showOnTrezor: 'SHOW ON TREZOR',
      showOnTrezorArray: [{key: 'false', value: false,}, {key: 'true', value: true,},],
      currencyArray: [{key: 'btc', value: 'Bitcoin',}, {key: 'bch', value: 'Bitcoin Cash',}, {key: 'btg', value: 'Bitcoin Gold',}, {key: 'ltc', value: 'Litecoin',}, {key: 'dash', value: 'Dash',}, {key: 'zcash', value: 'Zcash',}, {key: 'test', value: 'Testnet',}, {key: 'doge', value: 'Dogecoin',}, {key: 'vtc', value: 'Vertcoin',},],
      result: {
        path: [],
        serializedPath: '',
        address: '',
      },
    };
  },
  methods: {
    changeSelectedCurrency(key) {
      this.selectedCurrency = key;
    },
    changeShowTrezor(key) {
      this.showOnTrezor = key;
    },
    async handleSubmit() {
      let accountInfo = await TrezorService.getAddress(this.serializedPath(this.selectedCurrency, this.accountNumber-1, this.pathNumber-1), this.showOnTrezor, this.selectedCurrency);
      if(accountInfo.success) {
        // console.log(accountInfo.payload);
        this.displayFlag = false;
        this.result.address = accountInfo.payload.address;
        this.result.path = accountInfo.payload.path;
        this.result.serializedPath = accountInfo.payload.serializedPath;
      }
      else {
        this.selectedCurrency= 'SELECT A CURRENCY';
        this.accountNumber= '';
        this.pathNumber= '';
        this.showOnTrezor= 'SHOW ON TREZOR';
        this.$showErrorMsg({
          message: `${accountInfo.payload.error}`,
        });
      }
    },
    goBack () {
      this.displayFlag = true;
      this.selectedCurrency= 'SELECT A CURRENCY';
      this.accountNumber= '';
      this.pathNumber= '';
      this.showOnTrezor= 'SHOW ON TREZOR';
    },
    serializedPath (currency, account, pathNumber) {
      let coinArray = [{
        coin: 'Bitcoin',
        path: `m/49'/0'/${account}'/0/${pathNumber}`,
        symbol: 'btc',
      },
                       {
                         coin: 'Bitcoin Cash',
                         path: `m/44'/145'/${account}'/0/${pathNumber}`,
                         symbol: 'bch',
                       },
                       {
                         coin: 'Bitcoin Gold',
                         path: `m/44'/156'/${account}'/0/${pathNumber}`,
                         symbol: 'btg',
                       },
                       {
                         coin: 'Litecoin',
                         path: `m/49'/2'/${account}'/0/${pathNumber}`,
                         symbol: 'ltc',
                       },
                       {
                         coin: 'Dash',
                         path: `m/44'/5'/${account}'/0/${pathNumber}`,
                         symbol: 'dash',
                       },
                       {
                         coin: 'Zcash',
                         path: `m/44'/133'/${account}'/0/${pathNumber}`,
                         symbol: 'zcash',
                       },
                       {
                         coin: 'Testnet',
                         path: `m/49'/1'/${account}'/0/${pathNumber}`,
                         symbol: 'test',
                       },
                       {
                         coin: 'Dogecoin',
                         path: `m/44'/3'/${account}'/0/${pathNumber}`,
                         symbol: 'doge',
                       },
                       {
                         coin: 'Vertcoin',
                         path: `m/44'/28'/${account}'/0/${pathNumber}`,
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
