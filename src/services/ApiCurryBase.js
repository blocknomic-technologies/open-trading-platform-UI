import axios from 'axios';
import {
  Timeout,
  Unauthorized,
  InternalServerError,
  SomeError,
} from '@/utils/MockApiFailure';
import LocalStorage, { Keys, } from '@/utils/localStorage';
import EventBus, { EventNames, } from '@/eventBuses/default';

function handleAxiosError(error) {
  if (!error) {
    return InternalServerError;
  }
  if (error.response) {
    switch (error.response.status) {
      case 401:
        EventBus.$emit(EventNames.userSessionExpired);
        return Unauthorized;
      case 408:
        return Timeout;
    }
    if (error.response.status >= 500) {
      return InternalServerError;
    }
  } else if (error.code) {
    return InternalServerError;
  }
  return SomeError;
}

function addAuthTokenToRequest(headers) {
  const token = LocalStorage.get(Keys.jwtToken);
  if (token) {
    return Object.assign({}, headers || {}, {
      Authorization: `JWT ${token}`,
    });
  }
  return headers || {};
}


class ApiCurryBase {
  constructor() {
    this.curryAxios = axios.create({
      baseURL: process.env.VUE_APP_CURRY_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
  }

  get(path, params = {}, headers = {}) {
    return this.curryAxios.get(path, {
      params,
      headers: addAuthTokenToRequest(headers),
    }).catch(handleAxiosError);
  }

  post(path, data = {}, params = {}, headers = {}) {
    return this.curryAxios.post(path, data, {
      params,
      headers: addAuthTokenToRequest(headers),
    }).catch(handleAxiosError);
  }
}

export default new ApiCurryBase();
