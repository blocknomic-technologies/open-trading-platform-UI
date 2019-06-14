<template src="./template.html"></template>

<script>
import { stringArrayToHtmlList, } from '@/utils/utility';

export default {
  name: 'cash-withdrawls',
  data() {
    return {
      formValue: {
        amount: 0,
      },
    };
  },
  methods: {
    async withdrawCash() {
      let validationErrors = [];
      if (!(Number(this.formValue.amount) > 0)) {
        validationErrors.push('Invalid Amount');
      }

      // if (!this.formValue.recievingAddress)
      //   validationErrors.push('Recieving Address is required');

      // if (this.supportedCoins.indexOf(this.formValue.coin) < 0) {
      //   validationErrors.push('Coin not supported');        
      //   isCoinValid = false;
      // }

      // if(isAmountValid && isCoinValid && getCurrencyBalance(this.formValue.coin) < Number(this.formValue.amount)) {
      //   validationErrors.push(`Not Enough ${ this.formValue.coin.toUpperCase() } to withdraw`);                
      // }

      // if (!validationErrors.length) {
      //   response = await DepositService.generateWallet({ coin, });
      //   if (!response.status) {
      //     validationErrors.push(...(response.data.errors || []));
      //   }
      // }

      if (validationErrors.length) {
        this.$showErrorMsg({
          message: stringArrayToHtmlList(validationErrors),
        });
      } else {
        this.$showSuccessMsg({
          message: 'Withdrawl request accepted.',
        });
      }
    },
  },
};
</script>
