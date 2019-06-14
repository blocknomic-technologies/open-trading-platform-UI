import Vue from 'vue';
export default new Vue({
  methods: {
    showLoader() {
      this.$loader.show();
    },
  },
});
