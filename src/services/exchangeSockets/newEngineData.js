import store from '@/store.js';
import ExchangeDataEventBus from '@/eventBuses/exchangeData';

let tickerData = {};
let supportedPairs = [];
let engineWS;

function connectToPricey() {
  // alert("connecting");
  engineWS = new WebSocket('wss://pricey.taisenx.com/ticker');

  engineWS.onopen = handleOpen;

  engineWS.onmessage = handleMessage;
  engineWS.onclose = connectToPricey;
}

// engineWS.onerror = console.error;

function handleOpen() {

  // console.log('Connected to pricey');
}

function handleMessage({
  data,
}) {

  data = JSON.parse(data);
  
  switch (data.type) {
    case 'ticker_snapshot':
      supportedPairs = Object.keys(data.payload);
      savePairToStore();
      break;
    case 'ticker_snapshot_grouped':
      tickerData = data.payload;
      saveTickerDataToStore();
      break;
    case 'ticker_update':
      if (!tickerData[data.payload.basePair]) {
        tickerData[data.payload.basePair] = {};
      }
      if (!tickerData[data.payload.basePair][data.payload.pair]) {
        supportedPairs.push(data.payload.pair);
      }
      tickerData[data.payload.basePair][data.payload.pair] = data.payload;
      saveTickerDataToStore();
      // store.commit('changeTickerData', data.payload);
      break;
    case 'multiline_snapshot':
      sendMultilineSnapshot(data.payload);
      break;
    case 'multiline_data':
      sendMultilineUpdate(data.payload);
      break;
    default:
      break;
  }

}

function savePairToStore() {
  store.commit('changePairData', supportedPairs);
}

function saveTickerDataToStore() {
  store.commit('changeTickerData', tickerData);
}

function changeDataToMultiline(data) {
  return data.map(multilineObject);
}

function multilineObject(element) {
  return {
    ask: element.bestAsk,
    bid: element.bestBid,
    date: new Date(element.ts * 1000).toISOString(),
    volume: element.askDepth + element.bidDepth,
    asklegendColor: '#5fd66a',
    bidlegendColor: '#ff5353',
  };
}

function sendMultilineSnapshot(data) {
  ExchangeDataEventBus.$emit('multiline-snapshot', changeDataToMultiline(data));

}

function sendMultilineUpdate(data) {
  ExchangeDataEventBus.$emit('multiline-update', multilineObject(data));

}

function getSnapShot() {
  engineWS.send(JSON.stringify({
    type: 'multiline-subscribe',
    pair: store.getters.selectedPair,
    since: 10,
  }));
}
ExchangeDataEventBus.$on('multiline-initial', getSnapShot);
ExchangeDataEventBus.$on('change-symbol', getSnapShot);

connectToPricey();
