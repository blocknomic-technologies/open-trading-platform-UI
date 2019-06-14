<template src="./template.html"></template>

<script>
// @ is an alias to /src

import Vue from 'vue';
import News from './News/News.vue';
import TabBar from '@/components/TabBar/TabBar.vue';


export default {
  name: 'home',
  components: {
    News,
    TabBar,
  },
  data() {
    return {
      action: 'News',
      tabs: ['Login', 'News',],
      tabBarEventBus: new Vue(),
    };
  },
  methods: {
    loadSignup() {
      this.action = 'signup';
    },
    loadLogin() {
      this.action = 'login';
    },
    signUpComplete() {
      this.tabBarEventBus.$emit('change-active-tab', 'News');
    },
    onTabChange(activeTab) {
      if (activeTab === 'News') {
        return this.loadLogin();
      }
      return this.loadSignup();
    },
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;      
    },
    isPhoneVerified() {
      return this.$store.getters.isPhoneVerified;      
    },
  },
};
</script>
