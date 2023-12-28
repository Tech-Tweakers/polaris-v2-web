import axios from "axios";
import App from './App.vue';
import router from "./router";
import { createApp } from 'vue';
import vuetify from "./plugins/vuetify";
import Maska from "maska";
import VueMask from "@devindex/vue-mask";


import config from "./ts/config";
import { setupInterceptorsTo } from "./pages/login/interceptor";


const app = createApp(App)

setupInterceptorsTo(axios);

axios.defaults.baseURL = config.SERVER + ":" + config.PORT

// window.Buffer = Buffer;

app.use(vuetify)
app.use(VueMask);
app.use(Maska);
app.use(router)
app.config.globalProperties.axios = axios;
app.mount('#app')

