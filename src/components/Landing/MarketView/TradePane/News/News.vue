<template src="./template.html"></template>
<script>
import { Carousel, Slide, } from 'vue-carousel';
import CryptoNewsService from '@/services/CryptoNewsService.js';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  components: {
    Carousel,
    Slide,
    Spinner,
  },
  data() {
    return {
      current: 0,
      direction: 1,
      transitionName: 'fade',
      show: false,
      slides: [
        { className: 'blue wgr uehouiwhe giuwhegpio qhpwegio hqw[oeigq [ioehg [iwehg [wiehg[iwenfcm[i[ie h  [oeiwh f[qoIWHE FPQIOWH Q[woih q[wIHE Q[iwhe [fiewHJF [IehwfIOQE FPIOQefpu', },
        { className: 'red', },
        { className: 'yellow', },
      ],
      newsObjArr: [],
      navPage: 0,
      mainLength: 0,
      loadingFlag: true,
      pair: this.$store.getters.selectedPair,
    };
  },
  async mounted () {
    this.show = true;
    if(this.$store.getters.selectedExchange === 'bitmex') {
      this.newsObjArr = await this.newsFetch('BTC/USD');
    } else {
      this.newsObjArr = await this.newsFetch(this.$store.getters.selectedPair);
    }
    // this.newsObjArr = await this.newsFetch();
    this.loadingFlag = false;
    this.mainLength = this.newsObjArr.length;
  },
  methods: {
    slide(dir) {
      this.direction = dir;
      dir === 1
        ? (this.transitionName = 'slide-next')
        : (this.transitionName = 'slide-prev');
      let len = this.slides.length;
      this.current = (this.current + dir % len + len) % len;
    },
    // async newsFetch (pair) {
    async newsFetch (pair) {
      try {
        let newsData = await CryptoNewsService.newsData(pair);
        let tempData = [];
        // console.log(newsData);
        if(!newsData.length) {
          newsData = [];
          newsData = await CryptoNewsService.topNews();
        }
      
        newsData.forEach(element => {
          let newsObj = {
            image: '',
            title: '',
            description: '',
            url: '',
          };
          newsObj.image = `background-image: url(${element.originalImageUrl})`;
          newsObj.title = element.title;
          newsObj.description = element.description;
          newsObj.url = element.url;
          tempData.push(newsObj);
        });
        return tempData;
      }
      catch(error) {
        throw error;
      }
    },
    changeSlide(index, change) {
      if(this.navPage === 0 && change === -1)
        this.navPage = this.mainLength - 1;
      else if(this.navPage === this.mainLength  - 1 && change === 1)
        this.navPage = 0;
      else 
        this.navPage = index + change;
    },
  },
};
</script>
<style lang="scss" src="./style.scss" scoped></style>
