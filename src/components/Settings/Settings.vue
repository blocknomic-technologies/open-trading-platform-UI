<template src="./template.html"></template>
<script>
import Vue from 'vue';
import TabBar from '@/components/TabBar/TabBar.vue';

export default {
  name: 'settings',
  components: {
    TabBar,
  },
  data() {
    return {
      tabBarEventBus: new Vue(),
      tabRouteMapping: {
        Trezor: '/settings',
      },
    };
  },
  computed: {
    tabs() {
      return ['Trezor',];
    },
  },
  methods: {
  },
};
</script>

<style lang="scss" src="./style.scss" scoped>
</style>

