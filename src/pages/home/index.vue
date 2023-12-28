<script setup lang="ts">
import router from "../../router";

import login from "../login/login";
</script>

<template>
  <v-main>
    <v-container>
      <v-card max-width="1000" class="mx-auto pa-3">
        <v-row style="height: 80px">
          <v-col cols="12" class="d-flex justify-space-around align-center">
            <v-btn @click="router.push('./login')">Login</v-btn>

            <v-btn @click="login.actions.confirmarSaida()">Logout </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </v-main>
</template>

<style lang="scss" scoped>
// import { permissoes } from '@/helps/configuracoes'

.vMain {
  height: calc(100vh - 110px);
  width: 100%;
  display: flex;
}

.vLeft {
  width: 70vw;
}

.vRight {
  width: 30vw;
}

.vFooter {
  position: fixed;
  bottom: 0;
  height: 50px;
  width: 100%;
}
</style>
