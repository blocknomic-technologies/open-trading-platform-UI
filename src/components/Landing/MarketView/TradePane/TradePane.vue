<template src="./template.html"></template>

<script>
import Vue from 'vue';
import TradeTab from './TradeTab/TradeTab.vue';
import DepthChart from './DepthChart/DepthChart.vue';
import TabBar from '@/components/TabBar/TabBar.vue';
import Ticker from './Ticker/Ticker.vue';
import News from './News/News.vue';
import Balance from './Balance/Balance.vue';
import LiveTrades from './../BookPane/LiveTrades/LiveTrades';
import EventBus, { EventNames, } from '@/eventBuses/default';

export default {
  name: 'trade-pane',
  components: {
    TabBar,
    TradeTab,
    DepthChart,
    Ticker,
    Balance,
    LiveTrades,
    News,
  },
  data() {
    return {
      activeTab: 'News',
      tabs: {
        // notLoggedInTabs: ['Login',  'News',],
        loggedInTabs: [ 'Balance','News',],
      },
      height: 0,
      tabBarEventBus: new Vue(),
    };
  },
  updated() {
    this.height = this.$refs.tradePane.clientHeight;
  },
  mounted() {
    if(localStorage.getItem('jwt') && localStorage.getItem('mqtt') && localStorage.getItem('usnn')){
      this.tabBarEventBus.$emit('change-active-tab', 'News');
      this.activeTab= 'News';      
    }
    EventBus.$on(EventNames.userLogin, () =>
      this.tabBarEventBus.$emit('change-active-tab', 'News')
    );
    this.height = this.$refs.tradePane.clientHeight;
    EventBus.$on(EventNames.userLogout, this.userLogoutListener);
  },
  methods: {
    activeTabChange(activeTab) {
      this.activeTab = activeTab;
      // let el = document.getElementsByClassName('trade-pane-content')[0];
      // if (activeTab === 'Login') {
      //   el.style.height = 'calc(50% - 0px)';
      // } else if (activeTab === 'Ticker') {
      //   el.style.height = 'calc(50% - 15px)';
      // } else {
      //   el.style.height = 'auto';
      // }
    },
    userLogoutListener() {
      this.activeTab = 'News';
      this.tabBarEventBus.$emit('change-active-tab', 'News');
    },
  },
};
</script>


<style lang="scss" src="./style.scss" scoped></style>
