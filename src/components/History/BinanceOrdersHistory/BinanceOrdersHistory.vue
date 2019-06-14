<template src="./template.html"></template>

<script>
import HistoryService from '@/services/HistoryService.js';
import { dateToDisplayDateTime, } from '@/utils/utility';
import Spinner from '@/components/Spinner/Spinner.vue';

export default {
  name: 'binance-orders-history',
  components: {
    Spinner,
  },
  data() {
    return {
      history: [],
      pairs: ['ETHBTC','LTCBTC','BNBBTC','NEOBTC','QTUMETH','EOSETH','SNTETH','BNTETH','BCCBTC','GASBTC','BNBETH','BTCUSDT','ETHUSDT','HSRBTC','OAXETH','DNTETH','MCOETH','ICNETH','MCOBTC','WTCBTC','WTCETH','LRCBTC','LRCETH','QTUMBTC','YOYOBTC','OMGBTC','OMGETH','ZRXBTC','ZRXETH','STRATBTC','STRATETH','SNGLSBTC','SNGLSETH','BQXBTC','BQXETH','KNCBTC','KNCETH','FUNBTC','FUNETH','SNMBTC','SNMETH','NEOETH','IOTABTC','IOTAETH','LINKBTC','LINKETH','XVGBTC','XVGETH','SALTBTC','SALTETH','MDABTC','MDAETH','MTLBTC','MTLETH','SUBBTC','SUBETH','EOSBTC','SNTBTC','ETCETH','ETCBTC','MTHBTC','MTHETH','ENGBTC','ENGETH','DNTBTC','ZECBTC','ZECETH','BNTBTC','ASTBTC','ASTETH','DASHBTC','DASHETH','OAXBTC','ICNBTC','BTGBTC','BTGETH','EVXBTC','EVXETH','REQBTC','REQETH','VIBBTC','VIBETH','HSRETH','TRXBTC','TRXETH','POWRBTC','POWRETH','ARKBTC','ARKETH','YOYOETH','XRPBTC','XRPETH','MODBTC','MODETH','ENJBTC','ENJETH','STORJBTC','STORJETH','BNBUSDT','VENBNB','YOYOBNB','POWRBNB','VENBTC','VENETH','KMDBTC','KMDETH','NULSBNB','RCNBTC','RCNETH','RCNBNB','NULSBTC','NULSETH','RDNBTC','RDNETH','RDNBNB','XMRBTC','XMRETH','DLTBNB','WTCBNB','DLTBTC','DLTETH','AMBBTC','AMBETH','AMBBNB','BCCETH','BCCUSDT','BCCBNB','BATBTC','BATETH','BATBNB','BCPTBTC','BCPTETH','BCPTBNB','ARNBTC','ARNETH','GVTBTC','GVTETH','CDTBTC','CDTETH','GXSBTC','GXSETH','NEOUSDT','NEOBNB','POEBTC','POEETH','QSPBTC','QSPETH','QSPBNB','BTSBTC','BTSETH','BTSBNB','XZCBTC','XZCETH','XZCBNB','LSKBTC','LSKETH','LSKBNB','TNTBTC','TNTETH','FUELBTC','FUELETH','MANABTC','MANAETH','BCDBTC','BCDETH','DGDBTC','DGDETH','IOTABNB','ADXBTC','ADXETH','ADXBNB','ADABTC','ADAETH','PPTBTC','PPTETH','CMTBTC','CMTETH','CMTBNB','XLMBTC','XLMETH','XLMBNB','CNDBTC','CNDETH','CNDBNB','LENDBTC','LENDETH','WABIBTC','WABIETH','WABIBNB','LTCETH','LTCUSDT','LTCBNB','TNBBTC','TNBETH','WAVESBTC','WAVESETH','WAVESBNB','GTOBTC','GTOETH','GTOBNB','ICXBTC','ICXETH','ICXBNB','OSTBTC','OSTETH','OSTBNB','ELFBTC','ELFETH','AIONBTC','AIONETH','AIONBNB','NEBLBTC','NEBLETH','NEBLBNB','BRDBTC','BRDETH','BRDBNB','MCOBNB','EDOBTC','EDOETH','WINGSBTC','WINGSETH','NAVBTC','NAVETH','NAVBNB','LUNBTC','LUNETH','TRIGBTC','TRIGETH','TRIGBNB','APPCBTC','APPCETH','APPCBNB','VIBEBTC','VIBEETH','RLCBTC','RLCETH','RLCBNB','INSBTC','INSETH','PIVXBTC','PIVXETH','PIVXBNB','IOSTBTC','IOSTETH','CHATBTC','CHATETH','STEEMBTC','STEEMETH','STEEMBNB','NANOBTC','NANOETH','NANOBNB','VIABTC','VIAETH','VIABNB','BLZBTC','BLZETH','BLZBNB','AEBTC','AEETH','AEBNB','RPXBTC','RPXETH','RPXBNB','NCASHBTC','NCASHETH','NCASHBNB','POABTC','POAETH','POABNB','ZILBTC','ZILETH','ZILBNB','ONTBTC','ONTETH','ONTBNB','STORMBTC','STORMETH','STORMBNB','QTUMBNB','QTUMUSDT','XEMBTC','XEMETH','XEMBNB','WANBTC','WANETH','WANBNB','WPRBTC','WPRETH','QLCBTC','QLCETH','SYSBTC','SYSETH','SYSBNB','QLCBNB','GRSBTC','GRSETH','ADAUSDT','ADABNB','CLOAKBTC','CLOAKETH','GNTBTC','GNTETH','GNTBNB','LOOMBTC','LOOMETH','LOOMBNB','XRPUSDT','BCNBTC','BCNETH','BCNBNB','REPBTC','REPETH','REPBNB','TUSDBTC','TUSDETH','TUSDBNB','ZENBTC','ZENETH','ZENBNB','SKYBTC','SKYETH','SKYBNB','EOSUSDT','EOSBNB','CVCBTC','CVCETH','CVCBNB','THETABTC','THETAETH','THETABNB','XRPBNB','TUSDUSDT','IOTAUSDT','XLMUSDT','IOTXBTC','IOTXETH','QKCBTC','QKCETH','AGIBTC','AGIETH','AGIBNB','NXSBTC','NXSETH','NXSBNB','ENJBNB','DATABTC','DATAETH','ONTUSDT','TRXBNB','TRXUSDT','ETCUSDT','ETCBNB','ICXUSDT','SCBTC','SCETH','SCBNB','NPXSBTC','NPXSETH','VENUSDT','KEYBTC','KEYETH','NASBTC','NASETH','NASBNB','MFTBTC','MFTETH','MFTBNB','DENTBTC','DENTETH','ARDRBTC','ARDRETH','ARDRBNB','NULSUSDT','HOTBTC','HOTETH','VETBTC','VETETH','VETUSDT','VETBNB','DOCKBTC','DOCKETH','POLYBTC','POLYBNB','PHXBTC','PHXETH','PHXBNB','HCBTC','HCETH','GOBTC','GOBNB','PAXBTC','PAXBNB','PAXUSDT','PAXETH','RVNBTC','RVNBNB','DCRBTC','DCRBNB','USDCBNB','USDCBTC','MITHBTC','MITHBNB','BCHABCBTC','BCHSVBTC','BCHABCUSDT','BCHSVUSDT','BNBPAX','BTCPAX','ETHPAX','XRPPAX','EOSPAX','XLMPAX','RENBTC','RENBNB','XRPTUSD','EOSTUSD','XLMTUSD',],
      selectedPair: 'Select a Pair',
      spinnerFlag: false,
      sortBy: 0,
      searchString: '',
      initialData: [],
      displayText: 'No Records Found.',
    };
  },
  watch: {
    searchString: function() {
      this.updateData();
    },
  },
  methods: {
    formatDateTime(timestamp) {
      return dateToDisplayDateTime(new Date(timestamp));
    },
    copyReferral(id) {
      let copyText = document.querySelector(`#txhash${id}`);
      copyText.select();
      copyText.select();
      document.execCommand('copy');
      this.$showSuccessMsg({ message: 'Transaction Hash copied successfully.', });
    }, 
    async changeSelectedPair(pair){
      this.selectedPair = pair;
      let newVal = pair;
      this.spinnerFlag = true;
      let data = [];
      data = await HistoryService.binanceOrdersHistoryData(newVal);
      let parseData = [];
      if(data.data.error) {
        this.spinnerFlag = false;
        this.initialData = [];
        this.history = [];
        this.displayText = 'Invalid API-KEY or API-KEYS not Entered.';
        this.$showErrorMsg({
          message: 'Notice: Invalid API-KEY or API-KEYS not Entered.',
        });
      } 
      else {
        this.spinnerFlag = false;
        parseData = JSON.parse(data.data);
        this.initialData = parseData;
        if(this.history.length === 0 && this.displayText !== 'Invalid API-KEY or API-KEYS not Entered.')
          this.displayText = 'No Records Found.';
        this.updateData();
      }
    },
    updateData() {
      this.history = this.initialData.filter((ele) => {
        return ele.symbol.toString().includes(this.searchString) || ele.orderId.toLowerCase().includes(this.searchString.toLowerCase());
      });
      this.history = this.sortData(this.history);
    },
    sortData(data) {
      switch(this.sortBy) {
        case 0: 
          return data.reverse();
        case 1: 
          return data;
        case 101: 
          return data.sort((b,a) => {
            return a.price - b.price;
          });
        case 102: 
          return data.sort((b,a) => {
            return b.price - a.price;
          });
        case 201: 
          return data.sort((b,a) => {
            return a.origQty - b.origQty;
          });
        case 202: 
          return data.sort((b,a) => {
            return b.origQty - a.origQty;
          });
      }
    },
    sortDataBy(value) {
      if(this.sortBy === value) {
        this.sortBy += 1;
      } else {
        this.sortBy = value;
      }
      this.updateData();
    },
  },
};
</script>
<style lang="scss" src="./style.scss" scoped>
</style>


