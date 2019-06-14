import ExchangeDataEventBus from '@/eventBuses/exchangeData';
import store from '@/store';

let selectedPair = 'BTC/USD';
let ws2 = {
  readyState: 3,
};
// let bitfinexCache;
// let bequantCache;
let tickerSnapshotCache = {};
let priceAnalysisCache = {};
// let i = 1;

function ws_public_ticker() {

  ws2 = new WebSocket('wss://ticker.currycoins.com/');
  // ws2 = new WebSocket('ws://localhost:8002/');
  ws2.onopen = function () {
    ws2.send(JSON.stringify({
      type: 'ticker',
    }));
    ws2.send(JSON.stringify({
      type: 'exchange',
    }));
    /*  ws2.send(
       JSON.stringify({
         type: 'exchange'
       })
     );
     ws2.send(
       JSON.stringify({
         type: 'ticker'
 
       })
     ); */
  };

  ws2.onclose = function () {
    ws2 = null;
  };

  ws2.onmessage = function (e) {
    let msg = JSON.parse(decodeURIComponent(e.data));
    if (msg.type === 'ticker_res') {
      tickerSnapshot(msg.res);
    } else if (msg.type === 'exchange_res') {
      makeExchangeData(JSON.parse(msg.res));
    } else if (msg.type === 'snapshot') {
      // let snap = JSON.parse(msg.res);
      //bulkCreate(snap, msg.exchange);
      // console.log('exchange snapshot:', snap);
      //console.log('exchange:', msg.exchange);
      ExchangeDataEventBus.$emit('price-analysis-snapshot', msg);
    } else if (msg.type === 'live_data') {
      //console.log('live data:', msg.res);
      tickerUpdate(msg.res.compiled);
      PriceAnalysisTicker(msg.res.admin);
      //ExchangeDataEventBus.$emit('exchange-ticker', msg.res.admin);
      if (msg.res.admin.oPair == selectedPair) {
        // console.log('update in pair:',selectedPair);
        //PriceAnalysisTicker(msg.res.admin);
        //console.log('pair:', msg.res.admin);
        //makedata(msg.res);
        ExchangeDataEventBus.$emit('price-analysis', msg.res);
      }
    }
  };
}
ws_public_ticker();

function fetchSnapshot(){
  ws2.send(
    JSON.stringify({
      type: 'snapshot',
      exchange: 'bequant',
      pair: selectedPair,
    })
  );
  ws2.send(
    JSON.stringify({
      type: 'snapshot',
      exchange: 'bitfinex',
      pair: selectedPair,
    })
  );
}

ExchangeDataEventBus.$on('multiline-start', fetchSnapshot);

function tickerSnapshot(snapshot) {
  let snap = JSON.parse(snapshot);
  let tickerArray =[];
  snap.Items.sort((a, b) => a.pair.localeCompare(b.pair)).forEach(elem => {
    tickerArray.push(elem.pair);
    let arrPair = (elem.pair).split('/');
    let symbol = arrPair[0];
    let pair = arrPair[1];
    let liveTick = {
      'symbol': symbol,
      'pair': pair,
      'buy': elem.ask,
      'sell': elem.bid,
      'buyVolume': elem.depthAsk,
      'sellVolume': elem.depthBid,
      'finalSymbol': elem.pair,
    };
    store.commit('addSupportedPair', elem.pair);
    if (!tickerSnapshotCache[symbol]) {
      tickerSnapshotCache[symbol] = {};
    }
    tickerSnapshotCache[symbol][elem.pair] = liveTick;
    store.commit('tickerCache', tickerSnapshotCache);
  });
  
}

function tickerUpdate(ticker) {
  let arrPair = (ticker.pair).split('/');
  let symbol = arrPair[0];
  let pair = arrPair[1];
  let liveTick = {
    'symbol': symbol,
    'pair': pair,
    'buy': ticker.ask[1],
    'sell': ticker.bid[1],
    'buyVolume': ticker.ask[3],
    'sellVolume': ticker.bid[3],
    'finalSymbol': ticker.pair,
  };
  if (!tickerSnapshotCache[symbol]) {
    tickerSnapshotCache[symbol] = {};
  }
  tickerSnapshotCache[symbol][ticker.pair] = liveTick;
  store.commit('addSupportedPair', ticker.pair);
  store.commit('tickerCache', tickerSnapshotCache);
  //ExchangeDataEventBus.$emit('exchange-ticker', tickerSnapshotCache);

  // let arrPair = (ticker.oPair).split('/');
  // let symbol = arrPair[0];
  // let pair = arrPair[1];
  // let liveTick = {
  //   'symbol': symbol,
  //   'pair': pair,
  //   'buy': ticker.ask, 
  //   'sell': ticker.bid,
  //   'buyVolume': ticker.depthAsk,
  //   'sellVolume': ticker.depthBid,
  // };
  // tickerSnapshotCache[ticker.oPair] = liveTick;
  // store.commit('tickerCache', tickerSnapshotCache);
  // ExchangeDataEventBus.$emit('exchange-ticker', tickerSnapshotCache);
}

function makeExchangeData(exec) {
  exec.forEach(elem => {
    elem.data.Items.forEach(pair => {
      let pairObj = {
        ask: pair.ask,
        bid: pair.bid,
        depthAsk: pair.depthAsk,
        depthBid: pair.depthBid,
        exchange: elem.exchange,
      };
      if (!priceAnalysisCache[pair.pair]) {
        priceAnalysisCache[pair.pair] = {};
      }
      priceAnalysisCache[pair.pair][elem.exchange] = pairObj;
    });
  });
  ExchangeDataEventBus.$emit('p', priceAnalysisCache);
  //store.commit('priceAnalysisSnapShot', priceAnalysisCache);
}

function PriceAnalysisTicker(ticker) {
  let tickerObj = {
    ask: ticker.ask,
    bid: ticker.bid,
    depthAsk: ticker.depthAsk,
    depthBid: ticker.depthBid,
    exchange: ticker.exchange,
    pair: ticker.oPair,
  };
  if(!priceAnalysisCache[ticker.oPair]) {
    priceAnalysisCache[ticker.oPair] = {};
  }
  priceAnalysisCache[ticker.oPair][ticker.exchange] = tickerObj;
  // store.commit('priceAnalysisSnapShot', priceAnalysisCache);
  ExchangeDataEventBus.$emit('p', priceAnalysisCache);
}

ExchangeDataEventBus.$on('change-symbol', getSnapShot);

function getSnapShot(pair) {
  selectedPair = pair;
  ws2.send(
    JSON.stringify({
      type: 'snapshot',
      exchange: 'bequant',
      pair: selectedPair,
    })
  );
  ws2.send(
    JSON.stringify({
      type: 'snapshot',
      exchange: 'bitfinex',
      pair: selectedPair,
    })
  );
}
