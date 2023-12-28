<script setup lang="ts">
import { state, actions } from ".";
import { ref, nextTick } from "vue";
import xModal from "../xModal/xModal";

const login = ref(null);
const password = ref(null);
let eyeShow = ref(false);

nextTick(() => {
  state.modal = new xModal.create({
    el: "#confirmationUser",
    height: 360,
    width: 400,
    onOpen() {
      state.modal.setTitle(state.title);
      //@ts-ignore
      nextTick(() => login.value.focus());
    },
    onClose() {
      actions.clearState();
    },
  });
});
</script>

<template>
  <div id="confirmationUser">
    <div class="autorizacao">
      <div class="form mt-3">
        <v-icon size="44">mdi-lock</v-icon>

        <v-text-field
          class="mt-5 mx-5"
          label="Código Usuário"
          ref="login"
          id="login"
          v-model="state.cod_funcionario"
          autocomplete="off"
          append-icon="mdi-account"
          autocorrect="off"
          autocapitalize="off"
          @focus.native="$event.target.select()"
          @keypress.enter="
            () => {
              //@ts-ignore
              password.focus();

              //@ts-ignore
              password.select();
            }
          "
        ></v-text-field>

        <v-text-field
          label="Senha"
          ref="password"
          id="edtPass"
          class="mx-5"
          v-model="state.senha"
          :type="eyeShow ? 'text' : 'password'"
          autocomplete="off"
          :append-icon="eyeShow ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="eyeShow = !eyeShow"
          autocorrect="off"
          autocapitalize="off"
          prepend-inner-icon="mdi-key"
          @focus.native="$event.target.select()"
          @keypress.enter.prevent="actions.submitForm"
        ></v-text-field>

        <div class="d-flex justify-space-around mt-3">
          <v-btn variant="text" @click="actions.closeModal"> Cancelar </v-btn>

          <v-btn
            :disabled="state.preLoad"
            @click.prevent="actions.submitForm"
            color="primary"
          >
            <v-progress-circular
              v-show="state.preLoad"
              :size="25"
              :width="2"
              indeterminate
              class="mr-2"
            ></v-progress-circular>
            Confirmar
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.autorizacao {
  width: 90%;
  height: 90%;
  margin: auto;
}

.form {
  text-align: center;
}

.form .material-icons {
  margin-top: -25px !important;
}
</style>
