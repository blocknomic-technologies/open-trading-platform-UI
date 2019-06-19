import Vue from 'vue';
import Router from 'vue-router';
import Settings from '@/components/Settings/Settings.vue';
import History from '@/components/History/History.vue';
import BalanceTransfer from '@/components/BalanceTransfer/BalanceTransfer.vue';
import SummaryBequant from '@/components/BalanceTransfer/SummaryBequant/SummaryBequant.vue';
import SummaryBitfinex from '@/components/BalanceTransfer/SummaryBitfinex/SummaryBitfinex.vue';
import SummaryBinance from '@/components/BalanceTransfer/SummaryBinance/SummaryBinance.vue';
import SummaryBitmex from '@/components/BalanceTransfer/SummaryBitmex/SummaryBitmex.vue';
import ActiveTradesMobile from '@/components/ActiveTradesMobile/ActiveTradesMobile.vue';
import LocalStorage from '@/utils/localStorage.js';
import EventBus, {
  EventNames,
} from '@/eventBuses/default';
import Landing from '@/components/Landing/Landing.vue';
import Ticker from '@/components/TickerPage/TickerPage.vue';
import Trezor from '@/components/Settings/Trezor/Trezor.vue';
import TradeModalMobile from '@/components/TradeModalMobile/TradeModalMobile';

// import Home from '@/views/home/Home.vue';

Vue.use(Router);

const vueRouter = new Router({
  // mode: 'history',
  routes: [{
    path: '/',
    name: 'home',
    component: Landing,
    meta: {
      pageTitle: 'Blocknomic',
    },
  }, {
    path: '/markets',
    name: 'ticker-page',
    component: Ticker,
    meta: {
      pageTitle: 'Markets',
    },
  },
           {
             path: '/active-trades',
             name: 'active-trades-mobile',
             component: ActiveTradesMobile,
             meta: {
               pageTitle: 'Active Trades',
             },
           },
           {
             path: '/trade-modal',
             name: 'trade-modal-mobile',
             component: TradeModalMobile,
             meta: {
               pageTitle: 'Trade',
             },
           },
           {
             path: '/settings',
             component: Settings,
             children: [{
               path: '',
               name: 'trezor',
               component: Trezor,
               meta: {
                 pageTitle: 'Trezor - Blocknomic',
                 needLogin: false,
               },
             }, ],
           },
           {
             path: '/balance',
             component: BalanceTransfer,
             meta: {
               pageTitle: 'Wallets - Blocknomic',
               needLogin: false,
             },
             children: [{
               path: 'wallet-summary-bequant',
               name: 'wallet-summary-bequant',
               component: SummaryBequant,
               meta: {
                 pageTitle: 'Wallets - Blocknomic',
                 needLogin: false,
               },
             },
                        {
                          path: 'wallet-summary-bitfinex',
                          name: 'wallet-summary-bitfinex',
                          component: SummaryBitfinex,
                          meta: {
                            pageTitle: 'Wallets - Blocknomic',
                            needLogin: false,
                          },
                        },
                        {
                          path: '',
                          name: 'wallet-summary-binance',
                          component: SummaryBinance,
                          meta: {
                            pageTitle: 'Wallets - Blocknomic',
                            needLogin: false,
                          },
                        },
                        {
                          path: 'wallet-summary-bitmex',
                          name: 'wallet-summary-bitmex',
                          component: SummaryBitmex,
                          meta: {
                            pageTitle: 'Wallets - Blocknomic',
                            needLogin: false,
                          },
                        },
             ],
           },
           {
             path: '/history',
             name: 'history',
             component: History,
             meta: {
               pageTitle: 'History - Blocknomic',
               needLogin: false,
             },

           },
  ],
});

vueRouter.beforeEach((to, from, next) => {
  if (to.meta.needLogin && !LocalStorage.isUserLoggedIn()) {
    EventBus.$emit(EventNames.userSessionExpired);
    return next(false);
  }
  document.title = to.meta.pageTitle;
  return next();
});

vueRouter.afterEach(() => {
  Vue.nextTick().then(() => {
    window.scrollTo(0, 1);
    window.scrollTo(0, 0);
  });
});

export default vueRouter;
