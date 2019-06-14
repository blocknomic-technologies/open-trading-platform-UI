<template src="./template.html"></template>

<script>
import { stringArrayToHtmlList, } from '@/utils/utility';
import WithdrawlService from '@/services/WithdrawlService';

export default {
  name: 'crypto-withdrawls',
  data() {
    return {
      supportedCoins: ['btc', 'bch', 'ltc','xmr',],
      formValue: {
        amount: '',
        recievingAddress: '',
        coin: 'btc',
        emailOtp: '',
        id: '',
      },
      withdrawalFee: 0,
      otpSent: false,
      statuses: {
        btc: this.$store.getters.getBtcStatus,
        ltc: this.$store.getters.getLtcStatus,
        bch: this.$store.getters.getBchStatus,
        xmr: this.$store.getters.getXmrStatus,
      },
      fees: {
        btc: 0,
        bch: 0,
        ltc: 0,
      },
    };
  },
  watch: {
    'formValue.coin': {
      handler: function(to) {
        this.showFees(to);
      },
      deep: true,
    },
  },
  async created() {
    let fees = (await WithdrawlService.getWithdrawalFees()).data;
    fees.forEach((element) => {
      this.fees[element.currency] = parseFloat(element.fees.toString());
    });
    this.withdrawalFee = this.fees[this.formValue.coin];
  },
  methods: {
    getStatus(coin) {
      if(coin === 'btc') {
        return  this.$store.getters.getBtcStatus;
      } else  if(coin === 'bch') {
        return  this.$store.getters.getBchStatus;
      } else if(coin === 'ltc'){
        return  this.$store.getters.getLtcStatus;
      } else if(coin === 'xmr'){
        return  this.$store.getters.getXmrStatus;
      }
    },
    getGrpId(index) {
      return 'grp-a' + index;
    },
    async withdrawCrypto() {
      this.$store.commit('addLoaderTask', 1, false);
      this.formValue.id = `${Date.now()}`;
      let response;
      let validationErrors = [];
      // let isAmountValid = true;
      // let isCoinValid = true;
      if (!(Number(this.formValue.amount) > 0)) {
        validationErrors.push('Invalid Amount');
        // isAmountValid = false;
      }

      if (!this.formValue.recievingAddress)
        validationErrors.push('Recieving Address is required');

      if (this.supportedCoins.indexOf(this.formValue.coin) < 0) {
        validationErrors.push('Coin not supported');
        // isCoinValid = false;
      }

      // if (!validationErrors.length) {
      //   response = await DepositService.generateWallet({ coin, });
      //   if (!response.status) {
      //     validationErrors.push(...(response.data.errors || []));
      //   }
      // }
      if (!validationErrors.length) {
        response = await WithdrawlService.sendOTP(this.formValue);
        if (!response.status) {
          validationErrors.push(...(response.data.errors || []));
        }
      }
      if (validationErrors.length) {
        this.$showErrorMsg({
          message: stringArrayToHtmlList(validationErrors),
        });
      } else {
        this.otpSent = true;
        this.$showInfoMsg({
          message: 'OTP Sent to your registered Email Id.',
        });
      }
      this.$store.commit('removeLoaderTask', 1);
    },
    cancelWithdrawl() {
      this.formValue.recievingAddress = '';
      this.formValue.amount = '';
      this.formValue.emailOtp = '';
      this.otpSent = false;
      this.$showInfoMsg({
        message: 'Withdrawl request cancelled by user.',
      });
    },
    async confirmWithdrawl() {
      this.$store.commit('addLoaderTask', 1, false);
      let validationErrors = [];
      if (this.formValue.emailOtp === '') {
        validationErrors.push('Please enter the otp recieved.');
      }
      if (!validationErrors.length) {
        let response = await WithdrawlService.withdrawCrypto(this.formValue);
        if (!response.status) {
          validationErrors.push(...(response.data.errors || []));
        }
      }
      if (validationErrors.length) {
        this.$showErrorMsg({
          message: stringArrayToHtmlList(validationErrors),
        });
      } else {
        this.formValue.recievingAddress = '';
        this.formValue.amount = '';
        this.formValue.emailOtp = '';
        this.otpSent = false;
        this.$showSuccessMsg({
          message: 'Withdrawl request successful',
        });
      }
      this.$store.commit('removeLoaderTask', 1);
    },
    async showFees(coin) {
      this.withdrawalFee = this.fees[coin];
    },
  },
};
</script>
<style lang="scss" scoped>
.resend {
  line-height: 40px;
}
.resend :hover {
  color: var(--primary-text-color);
}
</style>
