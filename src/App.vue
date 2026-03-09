<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useTheme } from "vuetify";
import globalState from "@/store/globalState";

import $ from "jquery";

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

});
</script>

<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<style lang="scss">
@import "vuetify/styles";
@import "@mdi/font/css/materialdesignicons.css";
@import "sweetalert2/src/sweetalert2.scss";
@import "@/assets/index.css";
@import "animate.css";
@import "@/styles/global.css";

#pnCalk {
  top: 260px;
  left: 115px;
}
</style>
