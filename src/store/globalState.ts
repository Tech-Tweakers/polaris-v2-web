import { reactive } from "vue";

const state = reactive({
  nomeSistema: 'Polaris',
  defaultTheme: localStorage.getItem('defaultTheme') || 'light',
  theme: <any>{}
});

export default state;
