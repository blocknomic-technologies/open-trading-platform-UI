import Vue from 'vue';
import VueNotifications from 'vue-notifications';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

function toast({ title, message, type, timeout, }) {
  if (type === VueNotifications.types.warn) type = 'warning';
  return iziToast[type]({ title, message, timeout, });
}

const options = {
  success: toast,
  error: toast,
  info: toast,
  warn: toast,
};

Vue.use(VueNotifications, options);

const notificationComponent = new Vue({
  name: 'MyComponent',
  notifications: {
    showSuccessMsg: {
      type: VueNotifications.types.success,
      title: 'Success',
      message: 'It worked!',
    },
    showInfoMsg: {
      type: VueNotifications.types.info,
      title: 'Info',
      message: 'Nice to meet you.',
    },
    showWarnMsg: {
      type: VueNotifications.types.warn,
      title: 'Warning',
      message: 'BEWARE',
    },
    showErrorMsg: {
      type: VueNotifications.types.error,
      title: 'Error',
      message: 'Something went wrong.',
    },
  },
});

export default {
  install(Vue) {
    Vue.prototype.$showSuccessMsg = ({ title, message, timeout, } = {}) => {
      return notificationComponent.showSuccessMsg(
        JSON.parse(
          JSON.stringify({
            title,
            message,
            timeout: timeout || 20000,
          })
        )
      );
    };

    Vue.prototype.$showInfoMsg = ({ title, message, timeout, } = {}) => {
      return notificationComponent.showInfoMsg(
        JSON.parse(
          JSON.stringify({
            title,
            message,
            timeout: timeout || 20000,
          })
        )
      );
    };

    Vue.prototype.$showWarningMsg = ({ title, message, timeout, } = {}) => {
      return notificationComponent.showWarnMsg(
        JSON.parse(
          JSON.stringify({
            title,
            message,
            timeout: timeout || 20000,
          })
        )
      );
    };

    Vue.prototype.$showErrorMsg = ({ title, message, timeout, } = {}) => {
      return notificationComponent.showErrorMsg(
        JSON.parse(
          JSON.stringify({
            title,
            message,
            timeout: timeout || 20000,
          })
        )
      );
    };
  },
};
