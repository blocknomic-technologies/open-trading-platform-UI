let asksObj={},
  bidsObj={};
let symbol= '';
let precision  = 10;
onmessage = function(data) {
  data = data.data;
  precision = data.precision;
  let dataArray = data.data;
  switch(data.action) {
    case 'partial':
      if(symbol !== data.filter.symbol) {
        asksObj={};
        bidsObj={};
        symbol= data.symbol;
      }
      dataArray.forEach(element => {
        if(element.side === 'Buy') {
          asksObj[element.id] = {
            value: element.price,
            volume: element.size,
          };
        } else {
          bidsObj[element.id] = {
            value: element.price,
            volume: element.size,
          };
        }
      });
      sendMessage(true);
      break;
    case 'update':
      dataArray.forEach(element => {
        if(element.side === 'Buy') {
          if(asksObj[element.id]) {
            asksObj[element.id].volume = element.size;
          }
        } else {
          if(bidsObj[element.id]) {
            bidsObj[element.id].volume = element.size;
          }
        }
      });
      sendMessage(false);
      break;
    case 'insert':
      dataArray.forEach(element => {
        if(element.side === 'Buy') {
          asksObj[element.id] = {
            value: element.price,
            volume: element.size,
          };
        } else {
          bidsObj[element.id] = {
            value: element.price,
            volume: element.size,
          };
        }
      });
      sendMessage(false);
      break;
    case 'delete':
      dataArray.forEach(element => {
        if(element.side === 'Buy') {
          if(asksObj[element.id]) {
            delete asksObj[element.id];
          }
        } else {
          if(bidsObj[element.id]) {
            delete bidsObj[element.id];
          }
        }
      });
      sendMessage(false);
      break;
  }
};

function sendMessage(isSnapshot) {
  if(precision === 0) {
    postMessage({
      asks: sortData(Object.values(asksObj)),
      bids: sortData(Object.values(bidsObj)),
      isSnapshot,
    });
  } else {
    postMessage({
      asks: sortData(Object.values(Object.keys(asksObj).reduce(precisionObjectCreater, {}))),
      bids: sortData(Object.values( Object.keys(bidsObj).reduce(precisionBidsObjectCreater, {}))),
      isSnapshot,
    });
  }
}

function sortData(arr) {
  return arr.sort(function (b, a) {
    return a.value - b.value;
  });
}

function precisionObjectCreater(previous, current) {
  let roundedCurrent = roundANumber(asksObj[current].value);
  let roundedValue;

  if (precision === 0.1) {
    roundedValue = roundedCurrent.toFixed(2);
  } else {
    roundedValue = roundedCurrent;
  }
  if (!previous[roundedCurrent]) {
    previous[roundedCurrent] = {
      value: roundedValue,
      volume: 0,
    };
  }
  previous[roundedCurrent].volume += asksObj[current].volume;
  return previous;
}

function precisionBidsObjectCreater(previous, current) {
  let roundedCurrent = roundANumber(bidsObj[current].value);
  let roundedValue;
  if (precision === 0.1) {
    roundedValue = roundedCurrent.toFixed(2);
  } else {
    roundedValue = roundedCurrent;
  }
  if (!previous[roundedCurrent]) {
    previous[roundedCurrent] = {
      value: roundedValue,
      volume: 0,
    };
  }
  previous[roundedCurrent].volume += bidsObj[current].volume;
  return previous;
}

function roundANumber(number) {
  if(precision > 0 && precision < 1) {
    return (Math.round(number / precision) * precision).toFixed(countDecimals(precision));
  }
  return Math.round(number / precision) * precision;

}
function countDecimals(x) {
  if(Math.floor(x.valueOf()) === x.valueOf()) return 0;
  return x.toString().split('.')[1].length || 0; 
}
