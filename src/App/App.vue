<template>
  <div id="app">
    <header-section @show-deposit-modal="toggleDepositModal" @show-miner-modal="toggleMinerModal" />
     <div class="uk-hidden@m">
    <side-menu @show-deposit-modal="toggleDepositModal" @show-withdrawl-modal="toggleWithdrawlModal" @show-miner-modal="toggleMinerModal"  />

    </div>
    <modal-box internalComponent="deposit" v-if="$store.getters.isLoggedIn" :show='depositModalShown' @modal-closed='toggleDepositModal' />
    
    <modal-box internalComponent="miner" v-if="$store.getters.isLoggedIn" :show='minerModalShown' @modal-closed='toggleMinerModal' />

    <trade-modal v-if="$store.getters.isLoggedIn"/>
    <active-trades v-if="$store.getters.isLoggedIn"/>
    <notifications group="foo" />
    <loading :show="showLoader" :label="loaderLabel">
    </loading>
    <div class="page-wrapper">
      <router-view/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Loading from 'vue-full-loading';
import NotificationPlugin from '../plugins/notifications.js';
import EventBus, {
  EventNames,
} from '../eventBuses/default';
import ExchangeDataEventBus from '@/eventBuses/exchangeData';

import HeaderSection from '@/components/HeaderSection/HeaderSection.vue';
import SideMenu from '@/components/SideMenu/SideMenu.vue';
import ModalBox from '@/components/ModalBox/ModalBox.vue';
import TradeModal from '@/components/TradeModal/TradeModal.vue';
import ActiveTrades from '@/components/ActiveTrades/ActiveTrades.vue';
// import TournamentModal from '@/components/ModalBox/TournamentModal.vue';
import LocalStorage from '@/utils/localStorage.js';
import Vuikit from 'vuikit';
import Notifications from 'vue-notification';
import Datetime from 'vue-datetime';
// You need a specific loader for CSS files
import 'vue-datetime/dist/vue-datetime.css';
 
Vue.use(Datetime);
Vue.use(Vuikit);
Vue.use(Loading);
Vue.use(NotificationPlugin);
Vue.use(Notifications);
  
export default {
  components: {
    Loading,
    HeaderSection,
    SideMenu,
    ModalBox,
    TradeModal,
    ActiveTrades,
  },
  data() {
    return {
      loaderLabel: 'Loading...',
      depositModalShown: false,
      withdrawlModalShown: false,
      minerModalShown: false,
      
      firstModalShown: true,
      shouldOpen: false,
      selectedPair: this.$store.state.selectedPair,
    };
  },
  watch: {
    selectedPair() {},
    // '$store.getters.themeMode': function(val) {
    //   // this.tournamentModalShown = val === 'tournament' ? true : false;
    // },
  },
  computed: {
    showLoader() {
      return this.$store.getters.showLoader;
    },
  
    loaderCancellable() {
      return this.$store.getters.loaderCancellable;
    },
  
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    selectedPairto() {
      return this.$store.state.selectedPair;
    },
  },
  async created() {
    localStorage.shouldOpen = true;
    ExchangeDataEventBus.$emit('ticker-connect');

  },
  mounted() {
    this.loginListener = body => this.fetchConfigs(body.username);
    this.sessionExpiryListener = () => {
      if (LocalStorage.isUserLoggedIn()) {
        this.$showErrorMsg({
          message: 'Your session has expired. Please login again.',
        });
      }
      EventBus.$emit(EventNames.userLogout);
    };
  
    this.ledgerUpdatedListener = () => {
      this.$showSuccessMsg({
        message: 'Your Balances have been updated.',
      });
    };
    this.orderPlacedListener = () => {
      this.$showSuccessMsg({
        message: 'A new order has been placed for your account.',
      });
    };
    this.orderFilledListener = () => {
      this.$showSuccessMsg({
        message: 'One of your orders have been filled.',
      });
    };
    this.orderCanceledListener = () => {
      this.$showSuccessMsg({
        message: 'One of your orders have been cancelled.',
      });
    };
    this.orderPartiallyFilledListener = () => {
      this.$showSuccessMsg({
        message: 'One of your orders have been partially filled.',
      });
    };
    this.orderUpdatedListener = () => {
      this.$showSuccessMsg({
        message: 'One of your orders have been updated.',
      });
    };
    this.notificationListener = (data) => {
      if(data.data.type.toLowerCase() === 'success') {
        this.$showSuccessMsg({
          message: data.data.msg,
        });
      } else if(data.data.type.toLowerCase() === 'error'){
        this.$showErrorMsg({
          message: data.data.msg,
        });
      }
    };
    EventBus.$on(EventNames.userLogin, this.loginListener);
    EventBus.$on(EventNames.pairorexchnagechanged, this.fetchConfigs);
    EventBus.$on(EventNames.userSessionExpired, this.sessionExpiryListener);
    EventBus.$on(EventNames.ledgerUpdated, this.ledgerUpdatedListener);
    EventBus.$on(EventNames.orderPlaced, this.orderPlacedListener);
    EventBus.$on(EventNames.orderFilled, this.orderFilledListener);
    EventBus.$on(EventNames.orderCanceled, this.orderCanceledListener);
    EventBus.$on(EventNames.orderUpdated, this.orderUpdatedListener);
    EventBus.$on(EventNames.notification, this.notificationListener);
    EventBus.$on(
      EventNames.orderPartiallyFilled,
      this.orderPartiallyFilledListener
    );
    ExchangeDataEventBus.$on('afterSymbolAndExchangeChange',this.fetchConfigs);
  },
  destroyed() {
    EventBus.$off(EventNames.userLogin, this.loginListener);
    EventBus.$off(EventNames.userSessionExpired, this.sessionExpiryListener);
    EventBus.$off(EventNames.ledgerUpdated, this.ledgerUpdatedListener);
    EventBus.$off(EventNames.orderPlaced, this.orderPlacedListener);
    EventBus.$off(EventNames.orderFilled, this.orderFilledListener);
    EventBus.$off(EventNames.orderCanceled, this.orderCanceledListener);
    EventBus.$off(EventNames.orderUpdated, this.orderUpdatedListener);
    EventBus.$off(EventNames.notification, this.notificationListener);

    EventBus.$off(
      EventNames.orderPartiallyFilled,
      this.orderPartiallyFilledListener
    );
    ExchangeDataEventBus.$on('afterSymbolAndExchangeChange',this.fetchConfigs);
  },
  methods: {
    async fetchConfigs() {
      this.$store.commit('addLoaderTask', 1, false);
      this.$store.commit('removeLoaderTask', 1);
    },
    toggleDepositModal() {
      this.depositModalShown = !this.depositModalShown;
    },
    toggleWithdrawlModal() {
      this.withdrawlModalShown = !this.withdrawlModalShown;
    },
    toggleMinerModal() {
      this.minerModalShown = !this.minerModalShown;
    },
    closeBtnClicked() {
      sessionStorage.shouldOpen = true;
    },
  },
};
</script>

<style lang="scss" src="./style.scss">
  
</style>
