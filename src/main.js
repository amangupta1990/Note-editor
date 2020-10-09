import Vue from "vue";
import App from "./App.vue";
import '@/assets/css/tailwind.css'
import 'vue-simple-context-menu/dist/vue-simple-context-menu.css'
Vue.config.productionTip = false;
import VueSimpleContextMenu from 'vue-simple-context-menu';
Vue.component('vue-simple-context-menu', VueSimpleContextMenu)
new Vue({
  render: h => h(App)
}).$mount("#app");
