// import CryptoNewsApi from 'crypto-news-api'
// For ES5, use the below import instead
let CryptoNewsAPI = require('crypto-news-api').default;
let json = require('./currencyLabelMap.json');

class CryptoNewsService {
  newsData(pair) {
    let searchPair = [];
    let split = pair.split('/');
    for (let i = 0; i < split.length; i++) {
      for (let j = 0; j < json.length; j++) {
        if (json[j].key.toLowerCase() === split[i].toLowerCase()) {
          searchPair.push(json[j].value);
        }
      }
    }
    const Api = new CryptoNewsAPI('e266b96b67dda2c077c3f72cffbf0617');
    // const ProxyApi = new CryptoNewsAPI('e266b96b67dda2c077c3f72cffbf0617', 'http://cryptocontrol_proxy/api/v1/public');
    Api.enableSentiment();
    for (let k = 0; k < searchPair.length; k++) {
      return Api.getTopNewsByCoin(`${searchPair[k].toLowerCase()}`)
                .then(function(articles) { return articles; })
                .catch(function(error) { return error; });
    }
  }

  async topNews() {
    const Api = new CryptoNewsAPI('e266b96b67dda2c077c3f72cffbf0617');
    // const ProxyApi = new CryptoNewsAPI('e266b96b67dda2c077c3f72cffbf0617', 'http://cryptocontrol_proxy/api/v1/public');
    Api.enableSentiment();
    return await Api.getTopNews();
  }
}
export default new CryptoNewsService();
