import { reactive } from "vue";

const state = reactive({
  nomeSistema: 'Polaris',
  defaultTheme: localStorage.getItem('defaultTheme') || 'dark',
  theme: <any>{}
});

export default state;
