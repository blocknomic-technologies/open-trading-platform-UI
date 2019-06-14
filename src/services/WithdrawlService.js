import ApiCurryBase from './ApiCurryBase';

class WithdrawlService {
  async withdrawCrypto(body) {
    return (await ApiCurryBase.post('/save-crypto-withdrawl-request', body))
      .data;
  }
  async sendOTP(body) {
    return (await ApiCurryBase.post('/send-cryptowithdrawl-email-otp',body)).data;
  }
  async getWithdrawalFees() {
    return (await ApiCurryBase.post('/get-withdrawal-fees')).data;
  }
}

export default new WithdrawlService();
