import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueKonva from "vue-konva"; // vue-konva import
import "@/assets/css/reset.css";
import "@/assets/css/styles.css";
createApp(App).use(store).use(VueKonva).use(router).mount("#app");
