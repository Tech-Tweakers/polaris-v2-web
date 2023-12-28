import state from "./globalState";
import xModal from "@/plugins/xModal/xModal";
import xGrid from "@/plugins/xGridV2/index";


let controleLoad = false;
export default {
  async begin() {

    if (controleLoad) return

    controleLoad = true
    await this.getDataHora()

    controleLoad = false;

  },

  setThemeComponents(setRunTime?: false) {

    if (state.theme.current.dark) {
      xModal.setTheme("xModal-xAtila-dark");
      xGrid.setTheme("x-bocatan");
      document.querySelector('html').classList.add('dark')
    } else {
      xModal.setTheme("xModal-xAtila");
      xGrid.setTheme("x-whiteV2");
      document.querySelector('html').classList.remove('dark')
    }

  },

  toggleTheme() {

    state.theme.name = state.theme.current.dark ? "light" : "dark";
    localStorage.setItem("defaultTheme", state.theme.name);
    this.setThemeComponents(true);
  },


};
