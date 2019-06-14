import ApiCurryBase from './ApiCurryBase';

class SettingsService {
  async updatePassword(body) {
    return (await ApiCurryBase.post('/update-password',body)).data;
  }

  async verifyKyc(body) {
    return (await ApiCurryBase.post('/kyc-verification', body)).data;
  }

  async getProfileData() {
    return (await ApiCurryBase.get('/profile-data')).data;
  }

  async updateProfileData(body) {
    return (await ApiCurryBase.post('/update-data', body)).data;
  }
  
  async updateBank(body) {
    return (await ApiCurryBase.post('/update-bank', body)).data;
  }

  async getBankData() {
    return (await ApiCurryBase.get('/bank-data')).data;
  }

  async verifyPassword(pass) {
    return (await ApiCurryBase.post('/verify-password',{password: pass,})).data;

  }
}

export default new SettingsService();
