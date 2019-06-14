<template src="./template.html"></template>

<script>
export default {
  name: 'row-component',
  watch: {
    pair(from, to) {
      let key = 'flashGreen';
      if(parseFloat(from) > parseFloat(to)) {
        key = 'flashRed';
        this[key] = true;
      }
      this[key] = true;
          
      //   setTimeout(() => this[key] = false, 1000)
    },
  },
  props: {
    pair: {
      required: true,
    },
  },
  data(){
    return {
      flashRed: false,
      flashGreen: false,
    };
  },
};
  
</script>

<style lang="scss" src="./style.scss" scoped></style>
