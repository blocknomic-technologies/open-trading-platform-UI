<template src="./template.html"></template>


<script>
import '@/assets/js/amcharts/amcharts';
import '@/assets/js/amcharts/style.css';
import '@/assets/js/amcharts/serial';
import '@/assets/js/amcharts/amstock';
import '@/assets/js/amcharts/themes/black';
import '@/assets/js/amcharts/plugins/dataloader/dataloader.min.js';
// import "@/assets/js/amcharts/plugins/export/export.min.js";
// import "@/assets/js/amcharts/plugins/export/export.css";
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import Spinner from '@/components/Spinner/Spinner.vue';
import { mapGetters, } from 'vuex';

export default {
  name: 'depth-chart',
  components: {
    Spinner,
  },
  props: {
    height: Number,
    msg: String,
  },
  data() {
    return {
      chartData: {},
      divHeight: '',
      showLoader: true,
    };
  },
  computed: {
    ...mapGetters({
      limitTab: 'limitTab',
    }),
  },
  watch: {
    height: function(newVal) {
      let newV = newVal;
      this.divHeight = 'calc(100% - ' + newV + 'px)';
    },
  },

  mounted() {
    this.$root.$on('tabChange', data => {
      if (data == 'Limit') {
        this.height += 60;
      } else {
        this.height -= 60;
      }
    });
    this.snapshotListener = snap => {
      this.chartData = snap;
      setTimeout(() => {
        this.showLoader = false;
      }, 100);
      prepareChart(JSON.parse(JSON.stringify(this.chartData)));
      this.$store.commit('removeLoaderTask', 1);
    };
    this.updateListener = update => {
      this.chartData = update;
      this.showLoader = false;

      // prepareChart(JSON.parse(JSON.stringify(this.chartData)));
    };
    this.reset = () => {
      this.showLoader = true;
      this.chartData = [];
    };
    //this.liveTradeListener = liveTrade => this.trades.unshift(liveTrade);
    ExchangeDataEventBus.$on('snapshotOrderbook', this.snapshotListener);
    ExchangeDataEventBus.$on('updateOrderbook', this.updateListener);
    ExchangeDataEventBus.$on('subscribe-exchange', this.reset);
    ExchangeDataEventBus.$on('change-symbol', this.reset);
    ExchangeDataEventBus.$on('precision', this.reset);

    setInterval(() => {
      if (Object.keys(this.chartData).length !== 0) {
        let newchart = JSON.parse(JSON.stringify(this.chartData));
        newchart.bids.reverse();
        newchart.asks.reverse();
        prepareChart(newchart);
      }
    }, 1000);

    function prepareChart(data) {
      // console.log(data);

      function processData(list, type, desc) {
        list = list || [];

        if (desc) {
          for (let i = list.length - 1; i >= 0; i--) {
            if (i != list.length - 1) {
              list[i].totalvolume = list[i + 1].totalvolume + list[i].volume;
            } else {
              list[i].totalvolume = list[i].volume;
            }
            let dp = {};
            dp.value = list[i].value;
            dp[type + 'volume'] = list[i].volume;
            dp[type + 'totalvolume'] = list[i].totalvolume;
            //res.unshift(dp);
            res.unshift(dp);
          }
        } else {
          for (let i = 0; i < list.length; i++) {
            if (i > 0) {
              list[i].totalvolume = list[i - 1].totalvolume + list[i].volume;
            } else {
              list[i].totalvolume = list[i].volume;
            }
            let dp = {};
            dp.value = list[i].value;
            dp[type + 'volume'] = list[i].volume;
            dp[type + 'totalvolume'] = list[i].totalvolume;
            //res.push(dp);
            res.push(dp);
          }
        }
        chart.dataProvider = res;
        chart.validateData();
      }

      res = [];
      processData(data.bids, 'bids', false);
      processData(data.asks, 'asks', true);
    }

    let res = [];

    let chart = window.AmCharts.makeChart('depthchart', {
      type: 'serial',
      theme: 'black',
      dataProvider: res,
      rotate: true,
      fontFamily: 'Open Sans',
      fontSize: 12,
      graphs: [
        {
          id: 'bids',
          fillAlphas: 0.1,
          lineAlpha: 1,
          lineThickness: 2,
          lineColor: 'var(--green-color)',
          type: 'step',
          valueField: 'bidstotalvolume',
          balloonFunction: balloon,
        },
        {
          id: 'asks',
          fillAlphas: 0.1,
          lineAlpha: 1,
          lineThickness: 2,
          lineColor: 'var(--red-color)',
          type: 'step',
          valueField: 'askstotalvolume',
          balloonFunction: balloon,
        },
        {
          lineAlpha: 0,
          fillAlphas: 0.2,
          lineColor: 'var(--just-black)',
          type: 'column',
          clustered: false,
          valueField: 'bidsvolume',
          showBalloon: false,
        },
        {
          lineAlpha: 0,
          fillAlphas: 0.2,
          lineColor: 'var(--just-black)',
          type: 'column',
          clustered: false,
          valueField: 'asksvolume',
          showBalloon: false,
        },
      ],
      categoryField: 'value',
      chartCursor: {
        cursorColor: 'var(--mobile-bg-color)',
      },
      balloon: {
        textAlign: 'left',
      },
      valueAxes: [
        {
          axisColor: '#354145',
          color: 'var(--pri-label-color)',
          fontFamily: 'Open Sans',
          fontSize: 12,
          gridAlpha: 0,
          reversed: true,
          tickLength: 0,
        },
      ],
      categoryAxis: {
        minHorizontalGap: 100,
        startOnAxis: true,
        showFirstLabel: false,
        showLastLabel: false,
        color: 'var(--pri-label-color)',
        fontFamily: 'Open Sans',
        fontSize: 12,
        axisColor: '#354145',
        axisAlpha: 1,
        gridColor: '#354145',
        gridAlpha: 1,
        tickLength: 0,
      },
      export: {
        enabled: true,
      },
    });

    function balloon(item, graph) {
      let txt;
      if (graph.id == 'asks') {
        txt =
          'Ask: <strong>' +
          formatNumber(item.dataContext.value, graph.chart, 4) +
          '</strong><br />' +
          'Volume: <strong>' +
          formatNumber(item.dataContext.asksvolume, graph.chart, 4) +
          '</strong>';
      } else {
        txt =
          'Bid: <strong>' +
          formatNumber(item.dataContext.value, graph.chart, 4) +
          '</strong><br />' +
          'Volume: <strong>' +
          formatNumber(item.dataContext.bidsvolume, graph.chart, 4) +
          '</strong>';
      }
      return txt;
    }

    function formatNumber(val, chart, precision) {
      return window.AmCharts.formatNumber(val, {
        precision: precision ? precision : chart.precision,
        decimalSeparator: chart.decimalSeparator,
        thousandsSeparator: chart.thousandsSeparator,
      });
    }
  },
  destroyed() {
    ExchangeDataEventBus.$off('snapshotOrderbook', this.snapshotListener);
    ExchangeDataEventBus.$off('updateOrderbook', this.updateListener);
    ExchangeDataEventBus.$off('subscribe-exchange', this.reset);
    ExchangeDataEventBus.$off('change-symbol', this.reset);
  },
};
</script>

<style scoped lang="scss" src="./style.scss"></style>
