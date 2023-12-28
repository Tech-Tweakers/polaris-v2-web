<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useTheme } from "vuetify";
import globalState from "@/store/globalState";

import $ from "jquery";
import globalActions from "./store/globalActions";

globalState.theme = useTheme();

let install = ref(false);
let deferredPrompt: null;

nextTick(() => {
  window.addEventListener("appinstalled", () => {
    console.log("a2hs installed, --");
  });

  if (
    window.matchMedia("(display-mode: standalone)").matches ||
    //@ts-ignore
    window.navigator.standalone === true
  ) {
    install.value = false;
    console.log("display-mode is standalone");
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    //@ts-ignore
    deferredPrompt = e;
    install.value = true;
    console.log("beforeinstallprompt");

    setTimeout(() => {
      install.value = false;
    }, 10000);
  });

  //@ts-ignore
  window.$ = $;

  globalActions.setThemeComponents();
});

const installApp = () => {
  install.value = false;
  //@ts-ignore
  deferredPrompt.prompt();

  //@ts-ignore
  deferredPrompt.userChoice.then((choiceResult: any) => {
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the A2HS prompt");
    } else {
      console.log("User dismissed the A2HS prompt");
    }

    deferredPrompt = null;
  });
};
</script>

<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<style lang="scss">
@import "vuetify/styles";
@import "./plugins/xModal/xModal.css";
@import "./plugins/xGridV2/index.css";
@import "@mdi/font/css/materialdesignicons.css";
@import "sweetalert2/src/sweetalert2.scss";
@import "@/assets/index.scss";
@import "animate.css";
@import "@/styles/global.scss";

#pnCalk .xModal-modal-content {
  margin: 0 !important;
  padding: 0 !important;
}

#pnCalk {
  top: 260px;
  left: 115px;
}
</style>
