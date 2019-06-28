<template src="./template.html"></template>

<script>
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import SimpleBar from 'simplebar';
import Spinner from '@/components/Spinner/Spinner.vue';
import precisionMaps from '@/assets/json/precisionMaps.js';
import Decimal from 'decimal.js';
export default {
  name: 'order-book',
  components: {
    Spinner,
  },
  props: {
    parentHeight: Number,
  },
  data() {
    return {
      bids: [],
      asks: [],
      price: 0,
      tableHeight: '',
      orderHeight: '',
      timeout: '',
      showLoader: true,
      sum: 0,
      precisionNumber: 1,
      count: 1,
      barAsk: 0,
      barBid: 0,
    };
  },
  computed: {
    maxVol() {
      return Math.max(
        this.asks[this.asks.length - 1].totalVolume,
        this.bids[0].totalVolume
      );
    },
  },
  methods: {
    precision(key) {
      ExchangeDataEventBus.$emit('precision', {
        key,
        number: this.precisionNumber,
      });
      if (key === 'minus' && this.precisionNumber !== 0) {
        this.precisionNumber = this.precisionNumber - 1;
        this.count = parseFloat(
          new Decimal(this.count).dividedBy('10').toString()
        );
      } else if (key === 'plus' && this.precisionNumber !== 3) {
        this.precisionNumber = this.precisionNumber + 1;
        this.count = parseFloat(new Decimal(this.count).times(10).toString());
      }
      ExchangeDataEventBus.$emit('change-precision', {
        precisionPass: this.count,
        precisionNumber: this.precisionNumber,
      });
      this.timeout = setTimeout(() => this.scrollTopBookToBottom(), 2000);
    },
    scrollTopBookToBottom() {
      try {
        let el = document.getElementById('ob-hello1');
        let obj = new SimpleBar(el, {
          autoHide: false,
        });
        obj.getScrollElement().scrollTop = 9999999;
      } catch (e) {
        throw e;
        
      }
    },
    asksUpdater(parsedSnap) {
      if (parsedSnap && parsedSnap.asks && parsedSnap.asks.length) {
        let asks = [parsedSnap.asks.length,];
        for (let i = 0; i < parsedSnap.asks.length; i++) {
          if (i === 0) {
            parsedSnap.asks[i].totalVolume = parsedSnap.asks[i].volume;
          } else {
            parsedSnap.asks[i].totalVolume =
              parsedSnap.asks[i].volume + parsedSnap.asks[i - 1].totalVolume;
          }
          asks[parsedSnap.asks.length - (i + 1)] = parsedSnap.asks[i];
        }
        return asks.reverse();
      } else {
        this.barAsk = 0;
        return [];
      }
    },
    bidsUpdater(parsedSnap) {
      if (parsedSnap && parsedSnap.bids && parsedSnap.bids.length) {
        let bids = [];
        for (let i = parsedSnap.bids.length - 1; i >= 0; i--) {
          if (i === parsedSnap.bids.length - 1) {
            parsedSnap.bids[i].totalVolume = parsedSnap.bids[i].volume;
          } else {
            parsedSnap.bids[i].totalVolume =
              parsedSnap.bids[i].volume + parsedSnap.bids[i + 1].totalVolume;
          }
          bids.push(parsedSnap.bids[i]);
        }
        return bids.reverse();
      } else {
        this.barBid = 0;
        return [];
      }
    },
  },
  watch: {
    parentHeight: function(newVal) {
      let height = newVal / 2;
      let orderHeight = newVal / 2;
      let calcHeight = height - 40;
      this.tableHeight = calcHeight + 'px';
      this.orderHeight = orderHeight + 'px';
    },
  },
  created() {
    const { selectedExchange, selectedPair, } = this.$store.getters;
    if (precisionMaps[`${selectedExchange}-_-${selectedPair}`]) {
      this.count = precisionMaps[`${selectedExchange}-_-${selectedPair}`];
    } else {
      this.count = 1;
    }
    this.snapshotListener = snap => {
      this.showLoader = false;
      let parsedSnap = JSON.parse(JSON.stringify(snap));
      this.asks = this.asksUpdater(parsedSnap);
      this.bids = this.bidsUpdater(parsedSnap);
      this.barAsk = this.asks[this.asks.length - 1].totalVolume;
      this.barBid = this.bids[this.bids.length - 1].totalVolume;
      this.timeout = setTimeout(() => this.scrollTopBookToBottom(), 2000);
      this.$store.commit('removeLoaderTask', 1);
    };
    this.bookUpdateListener = snap => {
      let parsedSnap = JSON.parse(JSON.stringify(snap));
      this.asks = this.asksUpdater(parsedSnap);
      this.bids = this.bidsUpdater(parsedSnap);
      this.barAsk = this.asks[0].totalVolume;
      this.barBid = this.bids[this.bids.length - 1].totalVolume;
      this.showLoader = false;
    };
    this.reset = () => {
      const { selectedExchange, selectedPair, } = this.$store.getters;
      this.showLoader = true;
      if (precisionMaps[`${selectedExchange}-_-${selectedPair}`]) {
        this.count = precisionMaps[`${selectedExchange}-_-${selectedPair}`];
      } else {
        this.count = 1;
      }
      this.asks = [];
      this.bids = [];
      this.precisionNumber = 1;
    };
    this.liveTradeListener = liveTrade => {
      if (liveTrade.buyOrSell == 'sell') {
        this.price = -liveTrade.price;
      } else {
        this.price = liveTrade.price;
      }
    };
    ExchangeDataEventBus.$on('liveTrades', this.liveTradeListener);
    ExchangeDataEventBus.$on('subscribe-exchange', this.reset);
    ExchangeDataEventBus.$on('change-symbol', this.reset);
    ExchangeDataEventBus.$on('snapshotOrderbook', this.snapshotListener);
    ExchangeDataEventBus.$on('updateOrderbook', this.bookUpdateListener);
  },
  mounted() {
    this.$root.$on('tickerClicked', () => {
      this.scrollTopBookToBottom();
    });
  },
  destroyed() {
    ExchangeDataEventBus.$off('snapshotOrderbook', this.snapshotListener);
    ExchangeDataEventBus.$off('updateOrderbook', this.bookUpdateListener);
    ExchangeDataEventBus.$off('subscribe-exchange', this.reset);
    ExchangeDataEventBus.$off('change-symbol', this.reset);
    clearInterval(this.timeout);
  },
};
</script>

<style src="./style.scss" lang="scss" scoped></style>
