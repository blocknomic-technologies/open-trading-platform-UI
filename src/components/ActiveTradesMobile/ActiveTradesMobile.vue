<template src="./template.html"></template>

<script>
import { ModelSelect, } from 'vue-search-select';
import TradeService from '@/services/TradeService';
// import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import { Datetime, } from 'vue-datetime';
import Spinner from '@/components/Spinner/Spinner.vue';
import VueDraggableResizable from 'vue-draggable-resizable';
import EventBus, {
  EventNames,
} from '@/eventBuses/default';
import pairs from '../../assets/json/pairs';

export default {
  name: 'active-trades-mobile',
  components: {
    ModelSelect,
    datetime: Datetime,
    VueDraggableResizable,
    Spinner,
  },
  data() {
    return {
      activeOrders: [],
      openPositions: [],
      pos1: 0,
      pos2: 0,
      pos3: 0,
      pos4: 0,
      openOrders: true,
      styleObject: {},
      top: '25%',
      left: '25%',
      hideModal: true,
      newKey: '',
      exchangeList: [
        { value: 'bitfinex', text: 'Bitfinex', },
        { value: 'binance', text: 'Binance', },
        { value: 'bequant', text: 'Bequant', },
        { value: 'bitmex', text: 'Bitmex', },
      ],
      selectedExchange: {
        value: '',
        text: '',
      },
      pairList: [],
      pairsListExchangeWise: {},
      selectedPair: {
        value: '',
        text: '',
      },
      styleobj:{
        'z-index': 9999,
      },
      isLoading: false,
      isUpdating: false,
      marginExchangeList:[
        { value: 'bitfinex', text: 'Bitfinex', },
        { value: 'bitmex', text: 'Bitmex', },
      ],
      selectedMarginExchange:  {
        value: 'bitfinex',
        text: 'Bitfinex',
      },
      marginInfo: {},
    };
  },
  watch: {
    selectedExchange: function(exchange) {
      this.updatePairList(exchange);
      this.getActiveOrders();

    },
    selectedMarginExchange: function() {
      this.getActiveOrders();
    },
    selectedPair: function() {
      this.getActiveOrders();
    },
  },
  async created() {
    this.isLoading = true;
    document.addEventListener('keydown', this.handleKeyDown);
    this.pairsListExchangeWise =  pairs;
    this.openPositions =  (await TradeService.getOpenPositions(this.selectedMarginExchange.value)).data;
    this.activeOrders =  (await TradeService.getActiveOrders()).data;
    this.isLoading = false;
    this.marginInfo = (await TradeService.getMarginInfo()).data; 
    EventBus.$on(EventNames.notification, this.getActiveOrdersByNotify);
  },
  destroyed() {
    EventBus.$off(EventNames.notification, this.getActiveOrdersByNotify);
  },
  methods: {
    async getActiveOrders() {
      this.isUpdating = true;
      this.activeOrders =  (await TradeService.getActiveOrders(this.selectedExchange.value,this.selectedPair.value)).data;
      this.openPositions =  (await TradeService.getOpenPositions(this.selectedMarginExchange.value)).data;
      this.isUpdating = false;
    },
    async getActiveOrdersByNotify(data) {
      if(data.data.updateType === 'at') {   
        this.isUpdating = true;
        this.activeOrders =  (await TradeService.getActiveOrders(this.selectedExchange.value,this.selectedPair.value)).data;
        this.isUpdating = false;
      }
      if(data.data.updateType === 'pnl' && data.data.exchange.toLowerCase() === this.selectedMarginExchange.value.toLowerCase()) {   
        this.isUpdating = true;
        this.openPositions =  (await TradeService.getOpenPositions(this.selectedMarginExchange.value)).data;
        this.isUpdating = false;
      }
    
    },
    dragStart(event) {
      this.pos3 = event.clientX;
      this.pos4 = event.clientY;
      document.onmouseup = this.closeDragElement;
      document.onmousemove = this.elementDrag;
    },
    elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      this.pos1 = this.pos3 - e.clientX;
      this.pos2 = this.pos4 - e.clientY;
      this.pos3 = e.clientX;
      this.pos4 = e.clientY;
      // set the element's new position:
      this.top = this.$refs['dialog-box'].offsetTop - this.pos2 + 'px';
      this.left = this.$refs['dialog-box'].offsetLeft - this.pos1 + 'px';
    },
    closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    },
    closeTrade() {
      this.selectedExchange = {
        value: '',
        text: '',
      };
      this.selectedPair  = {
        value:  '',
        text: '',
      };
      this.pairList = [];
      this.hideModal = true;
    },
    handleKeyDown(event) {
      if ((event.key === 'o' && event.altKey) || ((event.altKey && event.which == 79))) {
        this.hideModal = !this.hideModal;
      }
    },
    updatePairList(exchange) {
      this.pairList = this.pairsListExchangeWise[exchange.text.toLowerCase()];
    },
    changeActiveTab() {
      this.openOrders = !this.openOrders;
    },
    async cancelOrder(cid,exchange,symbol) {
      await TradeService.cancelOrder({cid,exchange,symbol,});
    },
    async cancelBitfinexPosition(symbol,amount) {
      const response = await TradeService.placeNewOrder({
        formData:{
          amount,
        },
        exchange: 'bitfinex',
        pair: symbol,
        bnPair: symbol,
        orderType: 'MARKET',
      });
      if (response.status) {
        this.$showInfoMsg({
          message: 'Submitting close position request to exchange.',
        });
      } else {
        this.$showErrorMsg({
          message: `${this.selectedExchange.text}: ${response.data.msg}`,
        });
      }
    },
    async closeBitmexPosition(symbol) {
      let response = await TradeService.bitmexClosePosition(symbol);
      let parsedData = JSON.parse(response);
      if(parsedData.error) {
        this.$showErrorMsg({
          message: `Bitmex: ${parsedData.error.message}`,
        });
      } else {
        this.$showSuccessMsg({
          message: `Bitmex: Order with id ${parsedData.orderId} cancelled`,
        });
      }
    },
  },
};
</script>

<style lang="scss" src="./style.scss" scoped>
</style>

<style >
  .ui.selection.dropdown {
    color: white !important;
    background-color: transparent !important;
    border-bottom: 1px solid var(--header-border-color) !important;
  }
  .ui.dropdown .menu {
    color: white !important;
    background: var(--main-bg-color) !important;
  }
  .ui.selection.dropdown .menu > .item {
    border: none !important;
    color: white !important;
  }
  .ui.search.selection.dropdown > input.search {
    color: white;
  }
  .vdatetime-popup__header{
    background-color: var(--header-bg-color) !important;
  }
  .vdatetime-popup{
    background: var(--main-bg-color) !important;    
  }
  .vdr{
    min-height: fit-content !important;

  }
  .vdatetime-calendar__month__day--selected > span > span, .vdatetime-calendar__month__day--selected:hover > span > span {
    background: var(--sec-mobile-bg-color) !important;
  }
  .vdatetime-popup__actions__button,.vdatetime-year-picker__item--selected,.vdatetime-time-picker__item--selected{
    color: var(--sec-mobile-bg-color) !important;
  }
  #startDate {
    background-color: transparent !important;
    border: none !important;
    border-bottom: 2px solid var(--header-border-color) !important;
    color: white !important;
}

/* .handle-tl{
  top:0 !important;
  left:0 !important;
} */
.handle-tm{
  /* left: 15px !important; */
  left: 5px !important;
  /* top: 0 !important; */
  width: 100% !important;
}
.handle-tr{
  /* right: 0 !important; */
  /* top: 0 !important; */
}
.handle-mr{
  height: 100% !important;
top: 5px !important;
}
.handle-br{
  /* right: 0 !important;
  bottom: 0 !important; */
}
.handle-bm {
  left: 5px !important;
  width: 100% !important;
}
.handle-bl {
  /* bottom: 0 !important;
  left: 0 !important; */
}
.handle-ml {
  top: 5px !important;
  height: 100% !important;
}
.handle {
  background: transparent !important;
  border: none !important;
}

</style>
