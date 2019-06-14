import Vue from 'vue';
import App from '@/App/App.vue';
import router from './router';
import store from './store';
// import { connect, } from 'mqtt';
import LocalStorage, { Keys, } from '@/utils/localStorage.js';
import EventBus, { EventNames, } from '@/eventBuses/default';
import { uuidv4, } from './utils/utility';
import '@vuikit/theme';
import '@/assets/scss/base/icons.scss';
import '@/assets/scss/base/colors.scss';
import '@/assets/scss/base/core.scss';
import '@/assets/scss/base/typography.scss';
import '@/assets/scss/base/form-field.scss';
import '@/assets/scss/base/buttons.scss';
import '@/assets/scss/base/checkbox.scss';
import '@/assets/scss/base/containers.scss';
import '@/assets/scss/base/tables.scss';
import '@/assets/scss/base/scrollbar.scss';
import '@/assets/scss/base/panel.scss';
import '@/assets/scss/uk-overrides/modal.scss';
import '@/assets/scss/uk-overrides/subnav.scss';
import '@/assets/scss/uk-overrides/button.scss';
import '@/assets/scss/uk-overrides/tabs.scss';
import '@/assets/css/core.css';
import '@/assets/css/simplebar.css';
import '@/assets/css/colors.css';

import '@/services/exchangeSockets/hitbtc';
// import '@/services/exchangeSockets/bitfinex';
// import '@/services/exchangeSockets/coinex';
// import '@/services/exchangeSockets/binance';
// import '@/services/exchangeSockets/new_hitbtc';
import '@/services/exchangeSockets/new_binance';
import '@/services/exchangeSockets/new_bitfinex';
import '@/services/exchangeSockets/bitmex.js';
// import '@/services/exchangeSockets/engineData';
// import '@/services/exchangeSockets/newEngineData';
import StatusPageService from './services/StatusPageService';
import '@/services/exchangeSockets/newApiEngine';

const device = new WebSocket('ws://localhost:8085');


device.onopen = () => {};

if (!LocalStorage.get(Keys.pingUuid)) {
    LocalStorage.set(Keys.pingUuid, uuidv4());
}


EventBus.$on(EventNames.userLogin, () => {
    store.commit('isLoggedIn', true);
});

EventBus.$on(EventNames.userLogout, () => {
    const wasLoggedIn = store.getters.isLoggedIn;
    store.commit('isLoggedIn', false);
    store.commit('isPhoneVerified', false);
    store.commit('isKycVerified', false);
    store.commit('ledger', []);
    store.commit('activeOrders', []);
    store.commit('recentTrades', []);
    LocalStorage.clearLoginUserData();
    if (router.currentRoute.path !== '/' || wasLoggedIn) {
        router.push('/');
    }
});

const isLoggedIn = LocalStorage.isUserLoggedIn();
const loggedInUser = LocalStorage.get(Keys.username);
const mqttKey = LocalStorage.get(Keys.mqtt);


updateStatuses();
setInterval(updateStatuses, 30000);

async function updateStatuses() {
    let data = await StatusPageService.getStatusUpdate();
    data.data.forEach(element => {
        store.commit('changeStatusCodesValue', { name: element.name.toLowerCase(), status: element.status, });
    });
}

device.onmessage = (payload) => {
    const data = JSON.parse(payload.data);
    switch (data.type) {
        case 'ledger':
            store.commit('ledger', data.data);
            return EventBus.$emit(EventNames.ledgerUpdated);
        case 'orderPlaced':
            store.commit('ledger', data.data.ledger);
            store.commit('activeOrders', data.data.activeOrders);
            return EventBus.$emit(EventNames.orderPlaced);
        case 'orderFilled':
            store.commit('ledger', data.data.ledger);
            store.commit('activeOrders', data.data.activeOrders);
            store.commit('recentTrades', data.data.recentTrades);
            return EventBus.$emit(EventNames.orderFilled);
        case 'orderCanceled':
            store.commit('ledger', data.data.ledger);
            store.commit('activeOrders', data.data.activeOrders);
            store.commit('recentTrades', data.data.recentTrades);
            return EventBus.$emit(EventNames.orderCanceled);
        case 'orderPartiallyFilled':
            store.commit('ledger', data.data.ledger);
            store.commit('activeOrders', data.data.activeOrders);
            store.commit('recentTrades', data.data.recentTrades);
            return EventBus.$emit(EventNames.orderPartiallyFilled);
        case 'generalNoticeToUser':
            Vue.notify({
                group: 'foo',
                title: 'Important message',
                text: data.data.message,
                duration: 20000,
            });
            break;
        case 'generalNotice':
            Vue.notify({
                group: 'foo',
                title: 'Important message',
                text: data.data.message,
                duration: 20000,
            });
            break;
        case 'orderUpdated':
            store.commit('ledger', data.data.ledger);
            store.commit('activeOrders', data.data.activeOrders);
            EventBus.$emit(EventNames.orderUpdated);
            break;
        case 'bitfinexNotifications':
            EventBus.$emit(EventNames.notification, data);
            break;
    }
};

device.onerror = () => {};
device.onclose = () => {};

Vue.config.productionTip = false;

if (!isLoggedIn) {
    EventBus.$emit(EventNames.userLogout);
} else {
    EventBus.$emit(EventNames.userLogin, { username: loggedInUser, mqttKey: mqttKey, });
}

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');

if (!isLoggedIn) {
    EventBus.$emit(EventNames.userLogout);
} else {
    EventBus.$emit(EventNames.userLogin, { username: loggedInUser, mqttKey: mqttKey, });
}