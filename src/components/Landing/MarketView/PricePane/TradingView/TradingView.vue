// <template src="./template.html"></template>

<script>
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
export default {
  name: 'trading-view',
  data() {
    return {
      exchange: this.$store.state.selectedExchange,
      bitmexPathVariable: '',
    };
  },
  mounted() {
    if(this.exchange === 'bitmex') {
      this.bitmexPathVariable = `https://bitmex.blocknomic.com/index.html?symbol=BITMEX%3A${this.$store.state.selectedPair.toUpperCase()}&exchange=bitmex`;
    } else if(this.exchange === 'bitfinex') {
      let str1 = this.$store.state.selectedPair.toUpperCase();
      let res1 = str1.split('/');
      let noSlashPairBitfinex = res1[0] + res1 [1];
      this.bitmexPathVariable = `https://bitmex.blocknomic.com/index.html?symbol=BITFINEX%3A${noSlashPairBitfinex.toUpperCase()}&exchange=bitfinex`;
    } else if(this.exchange === 'binance') {
      let str2 = this.$store.state.selectedPair.toUpperCase();
      let res2 = str2.split('/');
      if(res2[0] === 'USD') {
        res2[0] = 'USDT';
      } else if(res2[1] === 'USD') {
        res2[1] = 'USDT';
      }
      let noSlashPairBinance = res2[0] + res2 [1];
      this.bitmexPathVariable = `https://bitmex.blocknomic.com/index.html?symbol=BINANCE%3A${noSlashPairBinance.toUpperCase()}&exchange=binance`;
    } else if(this.exchange === 'bequant') {
      let str3 = this.$store.state.selectedPair.toUpperCase();
      let res3 = str3.split('/');
      if(res3[0] === 'USD') {
        res3[0] = 'USDT';
      } else if(res3[1] === 'USD') {
        res3[1] = 'USDT';
      }
      let noSlashPairHitbtc = res3[0] + res3 [1];
      this.bitmexPathVariable = `https://bitmex.blocknomic.com/index.html?symbol=HITBTC%3A${noSlashPairHitbtc.toUpperCase()}&exchange=bequant`;
    }
  },
  methods: {
  },
  destroyed() {
    ExchangeDataEventBus.$emit('unsubscribe-candles');
    ExchangeDataEventBus.$off('snapshotCandles');
  },
};
</script>


// <style lang="scss" src="./style.scss" scoped></style>
