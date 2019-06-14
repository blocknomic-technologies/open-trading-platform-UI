import ApiCurryBase from './ApiCurryBase';

class PhoneOtpService {
  async sendOtp(body) {
    return (await ApiCurryBase.post('/send-phone-otp', body)).data;
  }

  async validatePhoneOtp(body) {
    return (await ApiCurryBase.post('/validate-phone-otp', body)).data;
  }
}

export default new PhoneOtpService();
