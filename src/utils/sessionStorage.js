class SessionStorage {
  set(key, data) {
    return window.sessionStorage.setItem(key, data);
  }

  get(key) {
    return window.sessionStorage.getItem(key);
  }

  remove(key) {
    return window.sessionStorage.removeItem(key);
  }

  removeAll() {
    return window.sessionStorage.clear();
  }
}

export default new SessionStorage();

export const Keys = {
};
