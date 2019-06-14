<template src="./template.html"></template>

<script>
import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import '@/assets/js/amcharts/amcharts';
import '@/assets/js/amcharts/style.css';
import '@/assets/js/amcharts/serial';
import '@/assets/js/amcharts/amstock';
import '@/assets/js/amcharts/themes/black';
import '@/assets/js/amcharts/plugins/dataloader/dataloader.min.js';

export default {
  name: 'multi-line',
  mounted() {
    let bestData = [];
    // let bequantCache = {};
    // let bitfinexCache = {};
    let selectedExchange = this.$store.state.selectedExchange;

    function changedataSet(name) {
      chart.dataSets.forEach((elem, index) => {
        if (elem.title == name) {
          chart.mainDataSet = chart.dataSets[index];
          chart.validateNow();
        }
      });
    }

    ExchangeDataEventBus.$emit('multiline-start', 'BTC/USD');
    ExchangeDataEventBus.$emit('multiline-initial');
    ExchangeDataEventBus.$on('multiline-snapshot', handleMultilineSnapshot);
    ExchangeDataEventBus.$on('multiline-update', handleMultilineUpdate);

    function handleMultilineSnapshot(snapshot) {
      
      bestData.length = 0;
      snapshot.forEach(element => {
        bestData.push(element);
      });

      chart.validateData();
    }

    function handleMultilineUpdate(multiLineUpdatePacket) {
      bestData.push(multiLineUpdatePacket);

      chart.validateData();
    }

    let chart = window.AmCharts.makeChart('multiline', {
      type: 'stock',
      theme: 'black',
      mouseWheelZoomEnabled: true,
      glueToTheEnd: true,
      dataSets: [
        {
          title: 'Best',
          fieldMappings: [
            {
              fromField: 'ask',
              toField: 'ask',
            },
            {
              fromField: 'bid',
              toField: 'bid',
            },
            {
              fromField: 'volume',
              toField: 'volume',
            },
          ],
          dataProvider: bestData,
          categoryField: 'date',
        },
      ],
      panels: [
        {
          showCategoryAxis: false,
          title: 'Value',
          percentHeight: 70,
          fontFamily: 'Open Sans',
          fontSize: 12,
          color: 'var(--pri-label-color)',
          stockGraphs: [
            {
              id: 'Ask',
              valueField: 'ask',
              comparable: true,
              compareField: 'ask',
              useDataSetColors: false,
              fixedColumnWidth: undefined,
              lineColorField: 'asklegendColor',
              fillColorsField: 'asklegendColor',
              legendColorField: 'asklegendColor',
              balloonText: '[[title]] Ask:<b>[[ask]]</b>',
              compareGraphBalloonText: '[[title]] Ask:<b>[[ask]]</b>',
            },
            {
              id: 'Bid',
              valueField: 'bid',
              comparable: true,
              compareField: 'bid',
              useDataSetColors: false,
              fixedColumnWidth: undefined,
              lineColorField: 'bidlegendColor',
              fillColorsField: 'bidlegendColor',
              legendColorField: 'bidlegendColor',
              balloonText: '[[title]] Bid:<b>[[bid]]</b>',
              compareGraphBalloonText: '[[title]] Bid:<b>[[bid]]</b>',
            },
          ],
          stockLegend: {
            valueTextComparing: '[[value]]',
            periodValueTextComparing: '[[value.close]]',
            periodValueTextRegular: '[[value.close]]',
            labelText: '[[title]]',
            valueFunction: function(graphDataItem, value) {
              //check for compared graphs
              if (graphDataItem.id == undefined) {
                let graphID = graphDataItem.graph.id;
                if (graphID.indexOf('Ask') !== -1) {
                  value = 'Ask' + ' ' + value;
                } else if (graphID.indexOf('Bid') !== -1) {
                  value = 'Bid' + ' ' + value;
                }
              } else {
                if (graphDataItem.id.indexOf('Ask') !== -1) {
                  value = 'Ask' + ' ' + value;
                } else if (graphDataItem.id.indexOf('Bid') !== -1) {
                  value = 'Bid' + ' ' + value;
                }
              }
              return value;
            },
            useMarkerColorForLabels: true,
          },
        },
        {
          title: 'Volume',
          fontFamily: 'Open Sans',
          fontSize: 12,
          color: 'var(--pri-label-color)',
          percentHeight: 30,
          stockGraphs: [
            {
              valueField: 'volume',
              type: 'column',
              dateFormat: 'YYYY-MM-DDTHH:MM:SS.QQQZ',
              showBalloon: false,
              fillAlphas: 1,
            },
          ],
          stockLegend: {
            valueTextComparing: '[[value]]',
            periodValueTextRegular: '[[value]]',
            useMarkerColorForLabels: true,
          },
        },
      ],

      chartScrollbarSettings: {
        graph: 'g1',
        usePeriod: 'ss',
        backgroundColor: '#354145',
        selectedBackgroundColor: 'var(--main-bg-color)',
      },
      categoryAxesSettings: {
        minPeriod: 'ss',
        maxSeries: 0,
        gridColor: '#354145',
        gridAlpha: 1,
      },
      chartCursorSettings: {
        valueBalloonsEnabled: true,
        fullWidth: true,
        cursorAlpha: 1,
        valueLineBalloonEnabled: true,
        valueLineEnabled: true,
        valueLineAlpha: 1,
        cursorColor: 'var(--mobile-bg-color)',
      },
      panelsSettings: {
        recalculateToPercents: 'never',
      },
      periodSelector: {
        position: 'bottom',
        dateFormat: 'YYYY-MM-DD JJ:NN:SS',
        inputFieldWidth: 150,
        periods: [
          {
            period: 'hh',
            count: 1,
            selected: true,
            label: '1 hour',
          },
          {
            period: 'hh',
            count: 12,
            label: '12 hours',
          },
          {
            period: 'MAX',
            label: 'MAX',
          },
        ],
      },
      categoryAxis: {
        parseDates: true,
        minPeriod: 'mm',
      },
      valueAxesSettings: {
        gridColor: '#354145',
        gridAlpha: 1,
      },
      export: {
        enabled: true,
        position: 'bottom-right',
      },
    });

    changedataSet(selectedExchange);
  },
  destroyed() {
    ExchangeDataEventBus.$off('price-analysis');
  },
};
</script>


<style lang="scss" src="./style.scss" scoped></style>
