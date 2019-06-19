class LocalStorage {
  set(key, data) {
    return window.localStorage.setItem(key, data);
  }

  get(key) {
    return window.localStorage.getItem(key);
  }

  remove(key) {
    return window.localStorage.removeItem(key);
  }

  removeAll() {
    return window.localStorage.clear();
  }

  isUserLoggedIn() {
    return true;
  }

  clearLoginUserData() {
    this.remove(Keys.jwtToken);
    this.remove(Keys.expTime);
    this.remove(Keys.refreshToken);
    this.remove(Keys.idToken);
    this.remove(Keys.username);
    this.remove(Keys.mqtt);
  }
}

export default new LocalStorage();

export const Keys = {
  jwtToken: 'jwt',
  expTime: 'expT',
  refreshToken: 'refreshT',
  idToken: 'idT',
  username: 'usnn',
  pingUuid: 'sth',
  mqtt: 'mqtt',
};
