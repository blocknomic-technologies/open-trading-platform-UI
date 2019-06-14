import ApiCurryBase from './ApiCurryBase';

class TwoFAService {
  async get2FAStatus() {
    return (await ApiCurryBase.post('/two-fa-Status')).data;
  }
  async set2FAStatus() {
    return (await ApiCurryBase.post('/setTwoFAStatus')).data;
  }
  async get2FAKey() {
    return (await ApiCurryBase.post('/getTwoFaKey')).data;
  }
  async resetFA() {
    return (await ApiCurryBase.post('/resetFA')).data;
  }
  async enable2FA(password) {
    return (await ApiCurryBase.post('/enableTwoFA',{password,})).data;
  }
  async verifyRegisteration(otp) {
    return (await ApiCurryBase.post('/verify-registeration',otp)).data;

  }
  async verifyDisableAndDisable(otp) {
    return (await ApiCurryBase.post('/diable-2fa',otp)).data;
  }
  async getMqttKey() {
    return (await ApiCurryBase.post('/get-mqtt-key')).data;
  }

}

export default new TwoFAService();
