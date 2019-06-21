<template src="./template.html"></template>

<script>
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import RowComponent from './RowComponent/RowComponent.vue';
import Spinner from '@/components/Spinner/Spinner.vue';
// import { dateToDisplayDateTime, } from '@/utils/utility';

// import Vue from 'vue';
export default {
  name: 'price-analysis',
  data() {
    return {
      tickers: [],
      hitTicker: {},
      bitTicker: {},
      hitprices: {},
      bitprices: {},
      ticker: {},
      coinexTicker: {},
      toggleOn: false,
      toggleFeesOn: true,
      compare: true,
      selectedKey: this.$store.getters.selectedPair,
      showLoader: false,
      activeExchange: this.$store.getters.selectedExchange,
      prices: [],
      exchangeData: false,
      statuses: {
        bequant: this.$store.getters.getbequantWebsocketsStatus,
        bitfinex: this.$store.getters.getBfxWebsocketsStatus,
      },
      ccPriceAnalysisData: {},
      selectedPairExchanges: [],
      bequantExists: true,
      bitfinexExists: true,
      coinexExists: true,
      bitmexRowsFlag: false,
    };
  },
  components: {
    RowComponent,
    Spinner,
  },
  watch: {
  },
  methods: {
    // getExchanges() {
    //   let exchanges = this.$store.getters.getSelectedPairExchanges;
    // },
    formatDateTime(timestamp) {
      return (new Date(timestamp).toLocaleString());
    },
    getStatus(exchange) {
      return this.$store.getters[`get${exchange}WebsocketsStatus`];
    },
    toggle() {
      if (this.toggleOn) {
        ExchangeDataEventBus.$emit('subscribe-all-ticker');
      } else {
        ExchangeDataEventBus.$emit('unsubscribe-all-ticker');
      }
      this.toggleOn = !this.toggleOn;
      //this.$store.commit('addLoaderTask', 3, false);
    },
    comapre() {
      if (this.compare) {
        ExchangeDataEventBus.$emit('compare-dataset');
      } else {
        ExchangeDataEventBus.$emit('uncompare-dataset');
      }
      this.compare = !this.compare;
    },
    connect(ex) {
      this.compare = true;
      if (this.activeExchange !== ex) {
        this.activeExchange = ex;
        ExchangeDataEventBus.$emit('subscribe-exchange', ex);
        this.$store.commit('selectedExchange', ex);
        ExchangeDataEventBus.$emit('afterSymbolAndExchangeChange');
        // this.$store.commit('addLoaderTask', 3, false);
      }

    },
    getData(key) {
      return this.prices[key];
    },
    changeSymbol(symbol) {
      alert('');
      // this.getExchanges();

      this.selectedKey = symbol;
      let ccData = this.$store.state.tickerData;
      this.selectedPairExchanges = this.$store.getters.getSelectedPairExchanges;
      this.ccPriceAnalysisData = ccData[symbol.split('/')[0]][symbol].exchanges;
      if (
        this.selectedPairExchanges.indexOf(
          this.$store.getters.selectedExchange
        ) <= -1
      ) {
        let availableExchange = this.selectedPairExchanges[0];
        this.$store.commit('selectedExchange', availableExchange);
        ExchangeDataEventBus.$emit('subscribe-exchange', availableExchange);
        this.$showWarningMsg({
          message: `Selected exchange has been changed to ${availableExchange.toUpperCase()} due to unavailability of ${symbol} on the selected exchange.`,
        });
        this.activeExchange = availableExchange;
      }
      ExchangeDataEventBus.$emit('afterSymbolAndExchangeChange');

      // console.log(this.ccPriceAnalysisData);
    },
    getccTickerData() {
      // alert("lovish");
      // console.log(this.$store.getters.getccTickerData, "lovish");
      return this.$store.getters.getccTickerData;
    },
    
  },
  created() {
    this.selectedKey = this.$store.state.selectedPair;
    this.selectedExchange = this.$store.state.selectedExchange;
    setTimeout(() => {
      ExchangeDataEventBus.$emit('subscribe-all-ticker');
    }, 1000);
    // this.toggle();
    this.tickerListner = res => {
      if (res.exchange == 'bequant') {
        this.hitTicker = res;
      } else if (res.exchange == 'coinex') {
        this.coinexTicker = res;
      } else {
        this.bitTicker = res;
      }
    };

    this.tickerListener = res => {
      // this.ticker[res.exchange] = res;
      this.$set(this.$store.state.tickerDataExc,res.exchange,res);
      // console.log(this.ticker);
    };
  
    // this.priceAnalysis = res => {
    //   this.prices = [];
    //   let data = res[this.selectedKey];
    //   Object.keys(data).forEach(elem => {
    //     let cc = data[elem];
    //     this.prices.push(cc);
    //   });
    // };
    // this.changeSymbol = symbol => {
    //   this.showLoader = true;
    //   this.selectedKey = symbol;
    // };
    // ExchangeDataEventBus.$on('ticker', this.tickerListner);
    ExchangeDataEventBus.$on('ticker', this.tickerListener);
    // ExchangeDataEventBus.$on("p", this.priceAnalysis);
    ExchangeDataEventBus.$on('change-symbol', this.changeSymbol);
  },
  destroyed() {
    // ExchangeDataEventBus.$off('ticker', this.tickerListner);
    ExchangeDataEventBus.$off('ticker', this.tickerListener);
    ExchangeDataEventBus.$off('change-symbol', this.changeSymbol);

    // ExchangeDataEventBus.$off("p", this.priceAnalysis);
  },
  computed: {
    tickerData() {
      return this.$store.state.tickerDataExc;

    },
  },
};
</script>


<style lang="scss" src="./style.scss" scoped></style>
