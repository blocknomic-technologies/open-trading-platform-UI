<template src="./template.html"></template>

<script>
import RecentTrades from './RecentTrades/RecentTrades.vue';
import ActiveTrades from './ActiveTrades/ActiveTrades.vue';

export default {
  name: 'trade-view',
  components: {
    RecentTrades,
    ActiveTrades,
  },
  data() {
    return {
      openAccordion: 'activeTrades',
    };
  },
  methods: {
    toggleOpen() {
      if(this.openAccordion === 'activeTrades') {
        this.openAccordion = 'recentTrades';
      } else {
        this.openAccordion = 'activeTrades';        
      }
    },
  },
};
</script>

<style lang="scss" src="./style.scss" scoped></style>


