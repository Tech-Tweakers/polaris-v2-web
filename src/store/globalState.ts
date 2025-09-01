import { reactive } from "vue";

const state = reactive({
  nomeSistema: 'Polaris',
  defaultTheme: localStorage.getItem('defaultTheme') || 'light',
  theme: <any>{},
  loading: false,
  error: <string | null>null,
});

export default state;
