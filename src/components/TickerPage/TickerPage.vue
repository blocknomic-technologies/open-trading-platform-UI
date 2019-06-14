<template src="./template.html"></template>

<script>
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import Spinner from '@/components/Spinner/Spinner.vue';
import MarginMarkets from './MarginMarkets/MarginMarkets';

export default {
  name: 'ticker-page',
  components: {
    Spinner,
    MarginMarkets,
  },
  data() {
    return {
      data: [],
      intialData: [],
      singleSelection: [],
      pageNumber:1,
      noOfPages: 1,
      pageLength: 12,
      filterExchange: '',
      sortBy: 0,
      showLoader: true,
      spot: true,
      marginData: {},
      availableIndices: [],
      availableContracts: [],
      activeTab: 'VOLUME',
      tabs: ['xxxx',],
    };
  },
  watch: {
    filterExchange: function () {
      this.updateTable();          
    },
    pageNumber: function () {
      this.updateTable();
      //   console.log((this.pageLength * (newVal - 1)) + 1, this.pageLength * newVal);
    },
    sortBy: function () {
      this.updateTable();
    },
    noOfPages: function () {
      this.pageNumber = 1;
    },
    singleSelection: function (singleSelection) {
      this.changePairAndExchange(this.data[singleSelection]);
    },   
  },
  methods: {
    updateInitialData(dataPacket) {
      this.intialData = dataPacket[0].SpotData;
      this.updateTable();
      this.parseMarginData(JSON.parse(dataPacket[0].Margin));
    },
    updateTable() {
      this.showLoader = true;
      if(this.filterExchange !== ''){
        this.data = this.intialData.filter((ele) => {
          return ele.SearchQuery.includes(this.filterExchange.toUpperCase());
        });
        this.data = this.sortData(this.data);

      } else {
        this.data = this.sortData(this.intialData);
      }
      this.noOfPages = Math.ceil(this.data.length / this.pageLength) || 1;
      if(this.data.length > 15) {
        this.data = this.data.slice((this.pageLength * (this.pageNumber - 1)) + 1, this.pageLength * this.pageNumber + 1);
      }
      this.showLoader = false;

    },
    sortData(data) {
      switch(this.sortBy) {
        case 0:
          return data;
        case 102:
          return data.sort(function(b,a) {
            return ((b.Volume * b.Price) - (a.Price * a.Volume));
          });
        case 101:
          return data.sort(function(a,b) {
            return ((b.Volume * b.Price) - (a.Price * a.Volume));
          });
        case 202:
          return data.sort(function(a,b) {
            return (a.PercentageChange - b.PercentageChange);
          });
        case 201:
          return data.sort(function(a,b) {
            return (b.PercentageChange - a.PercentageChange);
          });
        case 302:
          return data.sort(function(a,b) {
            return (a.Price - b.Price);
          });
        case 301:
          return data.sort(function(a,b) {
            return (b.Price - a.Price);
          });
        case 1:
          return data.reverse();
      }
    },
    calculateNoOfPages() {
      this.noOfPages = this.data.length / this.pageLength;
    },
    changePageNumber(index) {
      if(this.pageNumber - index > 0 && this.pageNumber -index <= this.noOfPages)
        this.pageNumber -= index;
    },
    changePageNumberToExtreme(index) {
      if(index) {
        this.pageNumber = this.noOfPages;
      } else {
        this.pageNumber = 1;
      }
    },
    changePairAndExchange(clickedData) {
      this.$store.commit('selectedPair', clickedData.TaisenxPair);
      this.$store.commit('selectedExchange',clickedData.Exchange.toLowerCase() );
      ExchangeDataEventBus.$emit('change-symbol', clickedData.TaisenxPair);
      this.$store.commit('buyPrice', clickedData.Ask);
      this.$store.commit('sellPrice', clickedData.Bid);
      this.$store.commit('precisionMap', clickedData.PrecisionMap);
      this.$store.state.tickerDataExc = {};
      // ExchangeDataEventBus.$emit('subscribe-exchange', clickedData.Exchange.toLowerCase() );
      ExchangeDataEventBus.$emit('afterSymbolAndExchangeChange');

      this.$router.push('/');
    },
    sortDataBy(value) {
      if(this.sortBy === value) {
        this.sortBy += 1;
      } else {
        this.sortBy = value;
      }
    },
    changeMarketType() {
      this.spot = !this.spot;
    },
    parseMarginData(marginData) {
      this.availableIndices = [];
      this.availableContracts = [];
      this.$store.state.bitmexPairs = [];
      marginData.forEach(element => {
        this.marginData[element.symbol] = element;
        if(element.symbol[0] === '.') {
          this.availableIndices.push({value: element.symbol, text: element.symbol,});
          this.$store.state.bitmexPairs.push({value: element.symbol, text: element.symbol,});
          
        } else {
          this.availableContracts.push({value: element.symbol, text: element.symbol,});
        }
      });
    },
  },
  mounted() {
    ExchangeDataEventBus.$on('ticker-new-update',this.updateInitialData);

  },
  destroyed() {
    ExchangeDataEventBus.$off('ticker-new-update');
    // ExchangeDataEventBus.$emit('ticker-disconnect');
   
  },
};
</script>

<style src="./style.scss" lang="scss" scoped>

</style>

<style lang="scss">
.marketsTable tbody tr:hover{
    -webkit-box-shadow: 0px 0px 5px 0px rgba(56,84,93,1);
    -moz-box-shadow: 0px 0px 5px 0px rgba(56,84,93,1);
    box-shadow: 0px 0px 5px 0px rgba(56,84,93,1);
    cursor: pointer;
    color: white !important;
}

.marketsTable th.vk-table-column {
 text-transform: Capitalize !important;
}

.marketsTable.uk-table td { 
    color: unset !important;
}

</style>
