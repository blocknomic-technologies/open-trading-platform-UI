<template src="./template.html"></template>

<script>
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import pairs from '../../../../../assets/json/keyMaps';
import TradeService from '@/services/TradeService';
import EventBus, {
  EventNames,
} from '@/eventBuses/default';
export default {
  name: 'balance',
  data() {
    return {
      balance: {},
      pair: this.$store.getters.selectedPair,
      exc: this.$store.getters.selectedExchange,
      marginInfo: {},
      showMarginInfo: false,
      marginBaseInfo:{},
    };
  },
  async created() {
    ExchangeDataEventBus.$on('change-symbol', this.getBalance);
    ExchangeDataEventBus.$on('afterSymbolAndExchangeChange', this.getBalance);
    EventBus.$on(EventNames.notification, this.getBalanceByNotify);

    this.getBalance();
  },
  methods: {
    async getBalance() {
      this.showLoader = true;
      this.pair = this.$store.getters.selectedPair;
      this.exc = this.$store.getters.selectedExchange.toLowerCase();
      if(this.exc === 'bitmex') {
        this.balance =(await TradeService.getLedger({selectedExchange: this.exc, selectedPair: '', orderType: 'SPOT',excPair: '', })).data;
        // await setTimeout(async () => {
        //   this.marginInfo =(await TradeService.bitmexGetUserMargin()).data;
        //   this.showMarginInfo = true;
        // },500);
      } else {
        this.excPair = pairs[`${this.exc}-_-${this.pair}`];
        this.balance =(await TradeService.getLedger({selectedExchange: this.exc, selectedPair:  this.pair, orderType: 'SPOT',excPair: this.excPair, })).data;
        if(this.exc === 'bitfinex') {
          await setTimeout(async () => {
            this.marginInfo =(await TradeService.getLedger({selectedExchange: this.exc, selectedPair:  this.pair, orderType: 'MARGIN',excPair: this.excPair, })).data;
  
          },500);
          await setTimeout(async () => {
            this.marginBaseInfo = (await TradeService.getMarginInfo()).data; 
            this.showMarginInfo = true;
  
          },500);
        } else {
          this.showMarginInfo = false;
        } 
      }
        
      this.showLoader= false;
    },
    async getBalanceByNotify(data) {
      if(data.data.updateType==='balance') {
        this.showLoader = true;
        this.pair = this.$store.getters.selectedPair;
        this.exc = this.$store.getters.selectedExchange.toLowerCase();
        this.excPair = pairs[`${this.exc}-_-${this.pair}`];
        this.balance =(await TradeService.getLedger({selectedExchange: this.exc, selectedPair:  this.pair, orderType: 'SPOT',excPair: this.excPair, })).data;
        if(this.exc === 'bitfinex') {
          await setTimeout(async () => {
            this.marginInfo =(await TradeService.getLedger({selectedExchange: this.exc, selectedPair:  this.pair, orderType: 'MARGIN',excPair: this.excPair, })).data;

          },500);
          await setTimeout(async () => {
            this.marginBaseInfo = (await TradeService.getMarginInfo()).data; 
            this.showMarginInfo = true;

          },500);
        } else {
          this.showMarginInfo = false;
        } 
        this.showLoader= false;
      }
    },
  },
  destroyed() {
    EventBus.$off(EventNames.notification, this.getBalanceByNotify);
    ExchangeDataEventBus.$off('afterSymbolAndExchangeChange', this.getBalance);
    ExchangeDataEventBus.$off('change-symbol', this.getBalance);

  },
};
</script>
<style lang="scss" src="./style.scss" scoped>

</style>
