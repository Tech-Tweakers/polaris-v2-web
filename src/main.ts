import App from './App.vue';
import router from "./router";
import { createApp } from 'vue';
import vuetify from "./plugins/vuetify";
import Maska from "maska";
import VueMask from "@devindex/vue-mask";
import apiClient from "./services/apiService";

const app = createApp(App)

app.use(vuetify)
app.use(VueMask);
app.use(Maska);
app.use(router)
app.config.globalProperties.apiClient = apiClient;
app.mount('#app')

