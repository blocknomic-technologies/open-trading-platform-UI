<template src="./template.html"></template>

<script>
import { ModelSelect, } from 'vue-search-select';
import TradeService from '@/services/TradeService';
// import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import { stringArrayToHtmlList, } from '@/utils/utility';
import { Datetime, } from 'vue-datetime';
import VueDraggableResizable from 'vue-draggable-resizable';
import keyMaps from '../../assets/json/keyMaps';
import pairs from '../../assets/json/pairs';
export default {
  name: 'trade-modal',
  components: {
    ModelSelect,
    datetime: Datetime,
    VueDraggableResizable,
  },
  data() {
    return {
      pos1: 0,
      pos2: 0,
      pos3: 0,
      pos4: 0,
      styleObject: {},
      top: '25%',
      left: '25%',
      hideModal: true,
      newKey: '',
      exchangeList: [
        { value: '1', text: 'Bitfinex', },
        { value: '2', text: 'Binance', },
        { value: '3', text: 'Bequant', },
        { value: '4', text: 'Bitmex', },
      ],
      selectedExchange: {
        value: '',
        text: '',
      },
      formData: {
        pair: 'BTC/USD',
        type: 'limit',
        exc: 'bitfinex',
        bos: 'buy',
        stopPrice: undefined,
        amount: undefined,
        price: undefined,
        moe: 'market',
        ocoStopPrice: undefined,
        icebergQty: undefined,
        tif: undefined,
      },
      pairList: [],
      orderTypes: [],
      pairsListExchangeWise: {
        bitfinex: [],
        binance: [],
        bequant: [],
        bitmex: [],
      },
      selectedPair: {
        value: '',
        text: '',
      },
      orderTypesList: {
        Bitfinex: {
          SPOT: [
            { value: 'EXCHANGE MARKET', text: 'EXCHANGE MARKET', },
            { value: 'EXCHANGE LIMIT', text: 'EXCHANGE LIMIT', },
            { value: 'EXCHANGE STOP', text: 'EXCHANGE STOP', },
            { value: 'EXCHANGE TRAILING STOP', text: 'EXCHANGE TRAILING STOP', },
            { value: 'EXCHANGE FOK', text: 'EXCHANGE FOK', },
            { value: 'EXCHANGE STOP LIMIT', text: 'EXCHANGE STOP LIMIT', },
          ],
          MARGIN: [
            { value: 'MARKET', text: 'MARKET', },
            { value: 'LIMIT', text: 'LIMIT', },
            { value: 'STOP', text: 'STOP', },
            { value: 'TRAILING STOP', text: 'TRAILING  STOP', },
            { value: 'FOK', text: 'FOK', },
            { value: 'STOP LIMIT', text: 'STOP LIMIT', },
          ],
        },
        Binance: {
          SPOT: [
            { value: 'LIMIT', text: 'LIMIT', },
            { value: 'MARKET', text: 'MARKET', },
            { value: 'STOP_LIMIT', text: 'STOP LIMIT', },
          ],
        },
        Bequant: {
          SPOT: [
            { value: 'limit', text: 'LIMIT', },
            { value: 'market', text: 'MARKET', },
            { value: 'stopLimit', text: 'STOP LIMIT', },
            { value: 'stopMarket', text: 'STOP MARKET', },
          ],
        },
        Bitmex: {
          MARGIN: [
            { value: 'Limit', text: 'LIMIT', },
            { value: 'Market', text: 'MARKET', },
            { value: 'StopLimit', text: 'STOP LIMIT', },
            { value: 'Stop', text: 'STOP MARKET', },
            { value: 'Stopt', text: 'TRAILING STOP', },
            { value: 'LimitIfTouched', text: 'TAKE PROFIT LIMIT', },
            { value: 'MarketIfTouched', text: 'TAKE PROFIT MARKET', },
          ],
        },
      },
      orderType: {
        value: '',
        text: '',
      },
      showConfirm: false,
      showLoader: false,
      marketTypeTemplate: false,
      limitTypeTemplate: false,
      stopOrder: false,
      styleobj: {
        'z-index': 999,
      },
      showBalances: false,
      ledgerData: [],
      orderTypeBasicList: {
        Bitfinex: [
          { value: 'spot', text: 'SPOT', },
          { value: 'margin', text: 'MARGIN', },
        ],
        Bequant: [{ value: 'spot', text: 'SPOT', },],
        Binance: [{ value: 'spot', text: 'SPOT', },],
        Bitmex: [{ value: 'margin', text: 'MARGIN', },],
      },
      orderTypeBasic: [],
      selectedOrderTypeBasic: { value: '', text: '', },
      flags: {
        tif: false,
        oco: false,
        hidden: false,
        reduceonly: false,
        postonly: false,
        iceberg: false,
        gtd: false,
        timeif: false,
        trigger: false,
        closeOnTrigger: false,
      },
      flagsVisibility: {
        tif: false,
        oco: false,
        hidden: false,
        reduceonly: false,
        postonly: false,
        iceberg: false,
        closeOnTrigger: false,
        trigger: false,
        gtd: false,
        timeif: false,
      },
      timeInForceList: [],
      timeInForce: {
        value: '',
        text: '',
      },
      gtd: false,
      // flags: [],
      flagsList: {
        Bitfinex: {
          SPOT: {
            'EXCHANGE LIMIT': ['oco', 'hidden', 'postonly', 'tif',],
            'EXCHANGE MARKET': ['',],
            'EXCHANGE STOP': ['tif',],
            'EXCHANGE TRAILING STOP': ['tif',],
            'EXCHANGE FOK': [],
            'EXCHANGE STOP LIMIT': [],
          },
          MARGIN: {
            LIMIT: ['oco', 'hidden', 'postonly', 'tif', 'reduceonly',],
            MARKET: ['reduceonly',],
            STOP: ['reduceonly', 'tif',],
            'TRAILING STOP': ['reduceonly', 'tif',],
            FOK: ['reduceonly',],
            'STOP LIMIT': ['reduceonly',],
          },
        },
        Binance: {
          SPOT: {
            LIMIT: ['iceberg', 'timeif',],
            MARKET: [],
            'STOP LIMIT': ['iceberg', 'timeif',],
          },
        },
        Bequant: {
          SPOT: {
            LIMIT: ['timeif', 'postonly',],
            MARKET: [],
            'STOP LIMIT': ['timeif', 'postonly',],
            'STOP MARKET': [],
          },
        },
        Bitmex: {
          MARGIN: {
            LIMIT: ['hidden', 'postonly', 'reduceonly',],
            MARKET: [],
            'STOP LIMIT': [
              'trigger',
              'closeOnTrigger',
              'timeif',
              'postonly',
              'reduceonly',
            ],
            'TAKE PROFIT LIMIT': [
              'trigger',
              'closeOnTrigger',
              'timeif',
              'postonly',
              'reduceonly',
            ],
            'STOP MARKET': ['trigger', 'closeOnTrigger',],
            'TAKE PROFIT': ['trigger', 'closeOnTrigger',],
            'TRAILING STOP': ['trigger', 'closeOnTrigger',],
          },
        },
      },
      timeInForceLists: {
        Bitfinex: [],
        Bitmex: [
          { value: 'GTC', text: 'GTC', },
          { value: 'IOC', text: 'IOC', },
          { value: 'FOK', text: 'FOK', },
        ],
        Binance: [
          { value: 'GTC', text: 'GTC', },
          { value: 'IOC', text: 'IOC', },
          { value: 'FOK', text: 'FOK', },
        ],
        Bequant: [
          { value: 'GTC', text: 'GTC', },
          { value: 'IOC', text: 'IOC', },
          { value: 'FOK', text: 'FOK', },
          { value: 'Day', text: 'Day', },
          { value: 'GTD', text: 'GTD', },
        ],
      },
      limitTypeOrders: [
        'EXCHANGE LIMIT',
        'STOP LIMIT',
        'LIMIT',
        'EXCHANGE STOP LIMIT',
        'FOK',
        'EXCHANGE FOK',
        'TRAILING STOP',
        'EXCHANGE TRAILING STOP',
        'TAKE PROFIT LIMIT',
        'TRAILING  STOP',
      ],
      stopOrders: [
        'STOP LIMIT',
        'STOP MARKET',
        'EXCHANGE STOP LIMIT',
        'EXCHANGE STOP MARKET',
        'EXCHANGE STOP',
        'STOP',
      ],
      tradeableBalance: -1,
      showTradeBal: false,
      excPair: '',
      buyPrice: 0,
      sellPrice: 0,
      triggerTypes: [
        { value: 'MarkPrice', text: 'MarkPrice', },
        { value: 'LastPrice', text: 'LastPrice', },
        { value: 'IndexPrice', text: 'IndexPrice', },
      ],
      leverage: 100,
      displayQty: null,
      placeholderText: {
        'EXCHANGE LIMIT': 'Limit Price',
        'STOP LIMIT': 'Limit Price',
        LIMIT: 'Limit Price',
        'EXCHANGE STOP LIMIT': 'Limit Price',
        'EXCHANGE FOK': 'Limit Price',
        'TRAILING STOP': 'Trail Value',
        'EXCHANGE TRAILING STOP': 'Limit Price',
        'TAKE PROFIT LIMIT': 'Limit Price',
        'TRAILING  STOP': 'Limit Price',
      },
    };
  },
  watch: {
    selectedExchange: function(newVal) {
      if (newVal.text != '') {
        this.formData.exc = newVal.text.toLowerCase();
        this.marketTypeTemplate = false;
        this.limitTypeTemplate = false;
        this.selectedPair = {
          value: '',
          text: '',
        };
        this.orderType = {
          value: '',
          text: '',
        };
        this.selectedOrderTypeBasic = {
          value: '',
          text: '',
        };
        this.timeInForce = {
          value: '',
          text: '',
        };
        (this.excPair = ''), (this.showBalances = false);
        this.updatePairList(newVal);
      }
    },
    selectedPair: async function(newVal) {
      if (newVal.text != '') {
        this.bosPrices = {};
        this.buyPrice = 0;
        this.sellPrice = 0;
        this.formData.pair = newVal.text;
        this.excPair =
          keyMaps[
            `${this.selectedExchange.text.toLowerCase()}-_-${
              this.selectedPair.text
            }`
          ];
        let balance = await TradeService.getLedger({
          selectedExchange: this.selectedExchange.text,
          selectedPair: this.selectedPair.text,
          orderType: this.orderTypeBasic.text,
          excPair: this.excPair,
        });
        this.ledgerDataProcess(balance.data);
        this.showBalances = true;
      }
    },
    selectedOrderTypeBasic: async function(newVal) {
      this.orderType = {
        value: '',
        text: '',
      };
      this.marketTypeTemplate = false;
      this.limitTypeTemplate = false;
      this.orderTypes = this.orderTypesList[this.selectedExchange.text][
        newVal.text
      ];
      let tradeableBalance = (await TradeService.getLedger({
        selectedExchange: this.selectedExchange.text,
        selectedPair: this.selectedPair.text,
        orderType: newVal.text,
        excPair: this.excPair,
      })).data.tradeable_balance;
      if (tradeableBalance) {
        this.tradeableBalance = tradeableBalance;
        this.showTradeBal = true;
      } else {
        this.tradeableBalance = -1;
        this.showTradeBal = false;
      }
    },
    orderType: function(newVal) {
      this.formData.type = newVal.text.toLowerCase();
      this.selectFlags(
        this.selectedExchange.text,
        this.selectedOrderTypeBasic.text,
        newVal.text
      );
      this.updateForm(newVal);
    },
    timeInForce: function(newVal) {
      if (newVal.text === 'GTD') {
        this.gtd = true;
      } else {
        this.gtd = false;
      }
    },
  },
  async created() {
    document.addEventListener('keydown', this.handleKeyDown);
    this.pairsListExchangeWise = pairs;
    // console.log(this.pairsListExchangeWise);
  },
  methods: {
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
      this.top = this.$refs['dialog-box'].offsetTop - this.pos2 + 'px';
      this.left = this.$refs['dialog-box'].offsetLeft - this.pos1 + 'px';
    },
    closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    },
    ledgerDataProcess(ledger) {
      this.ledgerData = ledger;
    },
    closeTrade() {
      this.reset();
      this.hideModal = true;
    },
    // keymonitor() {
    //     alert('sdfkjhn')
    // }

    selectFromParentComponent1() {
      // select option from parent component
      this.item = this.options[0];
    },
    reset2() {
      this.item2 = '';
    },
    selectFromParentComponent2() {
      // select option from parent component
      this.item2 = this.options2[0].value;
    },
    handleKeyDown(event) {
      if (
        (event.key === 't' && event.altKey) ||
        (event.altKey && event.which == 84)
      ) {
        this.hideModal = !this.hideModal;
      }
    },
    async updatePairList(exchange) {
      if (exchange.text.toLowerCase() === 'bitmex') {
        this.pairList = (await TradeService.getBitmexContracts()).data;
      } else {
        this.pairList = this.pairsListExchangeWise[exchange.text.toLowerCase()];
      }
      this.orderTypeBasic = this.orderTypeBasicList[exchange.text];
      this.timeInForceList = this.timeInForceLists[exchange.text];
    },
    updateForm(orderTypes) {
      if (orderTypes.value != '') {
        if (this.limitTypeOrders.includes(orderTypes.text)) {
          this.marketTypeTemplate = false;
          this.limitTypeTemplate = true;
        } else {
          this.limitTypeTemplate = false;
          this.marketTypeTemplate = true;
        }
        if (this.stopOrders.includes(orderTypes.text)) {
          this.stopOrder = true;
        } else {
          this.stopOrder = false;
        }
      }
    },
    initateTrade(buyOrSell) {
      this.formData.bos = buyOrSell;
      let validationErrors = [];
      if (this.limitTypeTemplate) {
        this.validateQty(validationErrors, 'Price', this.formData.price);
      }
      if (this.stopOrder) {
        this.validateQty(
          validationErrors,
          'Stop Price',
          this.formData.stopPrice
        );
      }
      if (this.flags.oco) {
        this.validateQty(
          validationErrors,
          'OCO Stop Price',
          this.formData.ocoStopPrice
        );
      }
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
      this.formData.price = undefined;
      this.showConfirm = false;
    },
    validateQty(errorsArray, placeholder, value) {
      if (!value || Number(value) === 0) {
        errorsArray.push(`${placeholder} is required.`);
      } else if ((value && Number.isNaN(Number(value))) || Number(value) < 0) {
        errorsArray.push(`${placeholder} is not valid.`);
      }
    },
    async makeTrade() {
      this.showLoader = true;
      this.formData.pair = this.$store.getters.selectedPair;
      const response = await TradeService.placeNewOrder({
        formData: this.formData,
        exchange: this.selectedExchange.text.toLowerCase(),
        pair: this.excPair,
        bnPair: this.selectedPair.text,
        orderType: this.orderType.value,
        flags: this.flags,
        tif: this.timeInForce.text,
        displayQty: this.displayQty,
      });
      setTimeout(() => {
        if (!response) {
          this.formData.amount = undefined;
          this.formData.price = undefined;
          this.showConfirm = false;
          this.$showErrorMsg({
            message: 'Timeout exceeded.',
          });
        }
      }, 15000);
      this.formData = {
        pair: 'BTC/USD',
        type: 'limit',
        exc: 'bitfinex',
        bos: 'buy',
        stopPrice: undefined,
        amount: undefined,
        price: undefined,
        moe: 'market',
        ocoStopPrice: undefined,
        icebergQty: undefined,
        tif: undefined,
      };
      this.flags = {
        tif: false,
        oco: false,
        hidden: false,
        reduceonly: false,
        postonly: false,
        iceberg: false,
        gtd: false,
        timeif: false,
      };
      this.showConfirm = false;

      if (response.status) {
        this.$showInfoMsg({
          message: 'Submitting order to exchange.',
        });
      } else {
        this.$showErrorMsg({
          message: `${this.selectedExchange.text}: ${response.data.msg}`,
        });
      }
      this.showLoader = false;
    },
    reset() {
      this.selectedExchange = {
        value: '',
        text: '',
      };
      this.selectedPair = {
        value: '',
        text: '',
      };
      this.orderType = {
        value: '',
        text: '',
      };
      this.selectedOrderTypeBasic = {
        value: '',
        text: '',
      };

      this.formData = {
        pair: 'BTC/USD',
        type: 'limit',
        exc: 'bitfinex',
        bos: 'buy',
        stopPrice: undefined,
        amount: undefined,
        price: undefined,
        moe: 'market',
      };
      this.marketTypeTemplate = false;
      this.limitTypeTemplate = false;
      this.pairList = [];
      this.orderTypes = [];
      this.ledgerData = [];
      this.showBalances = false;
    },
    selectFlags(exchange, orderBasic, orderType) {
      this.flagsVisibility = {
        tif: false,
        oco: false,
        hidden: false,
        reduceonly: false,
        postonly: false,
        iceberg: false,
        gtd: false,
        timeif: false,
      };
      this.flags = {
        tif: false,
        oco: false,
        hidden: false,
        reduceonly: false,
        postonly: false,
        iceberg: false,
        gtd: false,
        timeif: false,
      };
      let x = this.flagsVisibility;
      let flagList = this.flagsList[exchange][orderBasic][orderType];
      flagList.forEach(function(ele) {
        x[ele] = true;
      });
      this.flagsVisibility = x;
    },
    async calcPrice() {
      this.bosPrices = (await TradeService.calculatePrices({
        selectedExchange: this.selectedExchange,
        excPair: this.excPair,
        amount: this.formData.amount,
        origPair: this.selectedPair.text,
      })).data;
      if (this.selectedExchange.text.toLowerCase() === 'bitmex') {
        this.buyPrice =
          (this.formData.amount || 0) / Number(this.bosPrices.buy);
        this.sellPrice =
          (this.formData.amount || 0) / Number(this.bosPrices.sell);
      } else {
        this.buyPrice =
          Number(this.bosPrices.buy) * (this.formData.amount || 0);
        this.sellPrice =
          Number(this.bosPrices.sell) * (this.formData.amount || 0);
      }
    },
    async setBitmexLeverage() {
      let response = await TradeService.setBitmexleverage({
        symbol: this.selectedPair.text,
        leverage: this.leverage,
      });
      let parseddata = JSON.parse(response.data);
      if (parseddata.error) {
        this.$showErrorMsg({
          message: parseddata.error.message,
        });
      } else {
        this.$showSuccessMsg({
          message: 'Leverage updated',
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
.vdatetime-popup__header {
  background-color: var(--header-bg-color) !important;
}
.vdatetime-popup {
  background: var(--main-bg-color) !important;
}
.vdr {
  min-height: fit-content !important;
}
.vdatetime-calendar__month__day--selected > span > span,
.vdatetime-calendar__month__day--selected:hover > span > span {
  background: var(--sec-mobile-bg-color) !important;
}
.vdatetime-popup__actions__button,
.vdatetime-year-picker__item--selected,
.vdatetime-time-picker__item--selected {
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
.handle-tm {
  /* left: 15px !important; */
  left: 5px !important;
  /* top: 0 !important; */
  width: 100% !important;
}
.handle-tr {
  /* right: 0 !important; */
  /* top: 0 !important; */
}
.handle-mr {
  height: 100% !important;
  top: 5px !important;
}
.handle-br {
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
