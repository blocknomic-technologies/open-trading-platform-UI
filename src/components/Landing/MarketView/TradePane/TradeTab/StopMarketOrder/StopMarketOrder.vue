<template src="./template.html"></template>

<script>
import TradeService from '@/services/TradeService';
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import { stringArrayToHtmlList, } from '@/utils/utility';

export default {
  name: 'stop-marker-order',
  data() {
    return {
      showConfirm: false,
      formData: {
        pair: 'BTC/USD',
        type: 'stopMarket',
        exc: 'bitfinex',
        bos: 'buy',
        amount: undefined,
        stopPrice: undefined,
        moe: 'market',
      },
      fees: {
        maker: '',
        taker: '',
      },
      showLoader: false,
      statusCode: '',
      watcher: '',
    };
  },
  watch: {
    formData: {
      handler: function(to) {
        this.getStatus(to.exc);
        this.watcher = setInterval(() => {
          this.getStatus(to.exc);
        }, 5000);
      },
      deep: true,
    },
  },
  mounted() {
    this.watcher = setInterval(() => {
      this.getStatus(this.formData.exc);
    }, 5000);
    this.getStatus('auto');
    ExchangeDataEventBus.$on('change-symbol', this.changeSymbol);

  },
  methods: {
    pairChange() {
      this.$store.commit('addLoaderTask', 3, false);
      // console.log(this.$store.getters.getSelectedPairExchanges, "lovish");
      this.$store.commit('setAvailableExchanges');
      ExchangeDataEventBus.$emit(
        'change-symbol',
        this.$store.state.selectedPair
      );
    },
    getStatus(exc) {
      if (exc === 'auto') {
        this.statusCode = this.$store.getters.getAutoStatus;
      } else {
        this.statusCode = this.$store.getters[`get${exc}OrderStatus`];
      }
    },
    async getFees() {
      let fees = await TradeService.getFees();
      this.fees.maker = fees.data.maker;
      this.fees.taker = fees.data.taker;
    },
    confirmTrade(buyOrSell) {
      this.formData.bos = buyOrSell;
      let validationErrors = [];
      this.validateQty(validationErrors, 'Amount', this.formData.amount);
      if (validationErrors.length) {
        this.$showErrorMsg({
          message: stringArrayToHtmlList(validationErrors),
        });
      } else {
        this.showConfirm = true;
      }
    },
    cancelTrade() {
      this.formData.amount = undefined;
      this.showConfirm = false;
    },

    validateQty(errorsArray, placeholder, value) {
      if (!value || Number(value) === 0) {
        errorsArray.push(`${placeholder} is required.`);
      } else if ((value && Number.isNaN(Number(value))) || Number(value) < 0) {
        errorsArray.push(`${placeholder} is not valid.`);
      }
    },
    changeSymbol() {
      this.formData.exc = 'auto';
    },
    async makeTrade() {
      this.showLoader = true;
      this.formData.pair = this.$store.getters.selectedPair;
      const response = await TradeService.placeNewOrder(this.formData);
      setTimeout(() => {
        if(!response) {
          this.formData.amount = undefined;
          this.showConfirm = false;
          this.$showErrorMsg({
            message: 'Timeout exceeded.',
          });
        }
      },15000);
      this.formData.amount = undefined;
      this.showConfirm = false;
      if (response.status) {
        this.$showSuccessMsg({
          message: response.data.message,
        });
      } else {
        this.$showErrorMsg({
          message: response.data.message,
        });
      }
      this.showLoader = false;
    },
  },
  computed: {
    estimatedPriceBuy() {
      return (Number(this.$store.getters.buyPrice) * (Number(this.formData.amount)) || 0).toFixed(2);
    },
    estimatedPriceSell() {
      return (Number(this.$store.getters.sellPrice) * (Number(this.formData.amount)) || 0).toFixed(2);
    },
  },
  created() {
    this.getFees();
    // setTimeout(async () => await this.makeTrade(), 2000)
  },
  destroyed() {
    clearInterval(this.watcher);
    ExchangeDataEventBus.$off('change-symbol', this.changeSymbol);
  },
};
</script>

<style lang="scss" src="./style.scss" scoped>
</style>
