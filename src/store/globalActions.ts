import state from "./globalState";

let controleLoad = false;
export default {
    async begin() {
        if (controleLoad) return
        controleLoad = true
        await this.getDataHora()
        controleLoad = false;
    },

    toggleTheme() {
        state.theme.name = state.theme.current.dark ? "light" : "dark";
        localStorage.setItem("defaultTheme", state.theme.name);
    },

    clearError() {
        state.error = null;
    },
};
