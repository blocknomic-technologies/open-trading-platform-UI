<template src="./template.html"></template>
<script>
import Vue from 'vue';

export default {
  name: 'tab-bar',
  props: {
    mobileDropdown: {
      type: Boolean,
      required: false,
    },
    tabs: {
      required: true,
    },
    routeDriven: {
      default: false,
      type: Boolean,
    },
    tabRouteMap: {
      type: Object,
      required: false,
    },
    bus: {
      default: () => new Vue(),
    },
  },
  created() {
    this.bus.$on('change-active-tab', tab => {
      this.activeTab = tab;
      this.onTabChange(tab);
      this.$emit('tab-change', this.activeTab);
    });
  },
  data() {
    let activeTab;
    if (this.routeDriven) {
      activeTab = Object.keys(this.tabRouteMap).find(
        item => this.tabRouteMap[item] === this.$route.path
      );
      if (!activeTab) {
        this.$router.push('/');
      }
    } else {
      activeTab = this.tabs[0];
    }
    return {
      activeTab,
    };
  },
  methods: {
    setActive(tab) {
      this.activeTab = tab;
      this.onTabChange(tab);
    },
    onTabChange(tab) {
      this.activeTab = tab;
      this.$emit('tab-change', this.activeTab);
      if (this.routeDriven) {
        this.$router.push(this.tabRouteMap[tab] || '/');
      }
    },
    onDropDownTabChange(tab) {
      this.$children[1].hide();
      this.onTabChange(tab);
    },
  },
};
</script>

<style lang="scss" src="./style.scss" scoped>
</style>
