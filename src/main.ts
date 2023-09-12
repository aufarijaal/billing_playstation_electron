import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import ToastPlugin from "vue-toast-notification";
// import 'vue-toast-notification/dist/theme-default.css';
import "./toast-custom-style.css";
import "vue-json-pretty/lib/styles.css";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
});

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(router)
  .use(ToastPlugin, {
    position: "bottom-right",
  })
  .use(vuetify)
  .mount("#app")
  .$nextTick(() => postMessage({ payload: "removeLoading" }, "*"));
