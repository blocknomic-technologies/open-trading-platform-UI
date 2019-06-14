<template src="./template.html"></template>

<script>

import { stringArrayToHtmlList, } from '@/utils/utility';
import PhoneOtpService from '@/services/PhoneOtpService.js';

export default {
  name: 'phone-update',
  data() {
    return {
      formValue: {
        phoneNumber: '',
        phoneOtp: '',
      },      
      buttonText: 'Send OTP',
      otpSent: false,
    };
  },
  methods: {

    handleSubmit() {
      if(this.otpSent) {
        return this.verifyOtp();
      }
      return this.sendOtp();      
    },

    async sendOtp() {
      this.validationErrors = [];
      if (!this.formValue.phoneNumber) {
        this.validationErrors.push('Phone Number is required');
      } else if (this.formValue.phoneNumber.charAt(0) !== '+') {
        this.validationErrors.push('Country Code with + symbol is required');        
      }
      if (!this.validationErrors.length) {
        const response = await PhoneOtpService.sendOtp(this.formValue);
        if (!response.status) {
          this.validationErrors.push(...(response.data.errors || []));
        }
      }
      if (this.validationErrors.length) {
        this.$showErrorMsg({
          message: stringArrayToHtmlList(this.validationErrors),
        });
      } else {
        this.otpSent = true;
        this.$showSuccessMsg({
          message: `OTP Sent to ${this.formValue.phoneNumber}`,
        });
        this.buttonText = 'Verify OTP';                  
      }
    },

    async verifyOtp() {
      this.validationErrors = [];      
      if (!this.formValue.phoneOtp) {
        this.validationErrors.push('OTP is required');
      }

      if (!this.validationErrors.length) {
        const response = await PhoneOtpService.validatePhoneOtp(this.formValue);
        if (!response.status) {
          this.validationErrors.push(...(response.data.errors || []));
        }
      }
      if (this.validationErrors.length) {
        this.$showErrorMsg({
          message: stringArrayToHtmlList(this.validationErrors),
        });
      } else {
        this.$emit('phone-verified');
        this.$showSuccessMsg({
          message: 'Phone verified successfully',
        });      
      }
    },
  },
};
</script>
<style lang="scss" src="./style.scss" scoped>

</style>

