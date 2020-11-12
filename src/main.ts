import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import "@/assets/css/tailwind.css";
import router from "./router";
import store from "./store";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import VueSimpleContextMenu from "vue-simple-context-menu";
Vue.component("vue-simple-context-menu", VueSimpleContextMenu);
import "vue-simple-context-menu/dist/vue-simple-context-menu.css";
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
