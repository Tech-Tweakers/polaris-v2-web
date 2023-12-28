<script setup lang="ts">
import { state, actions } from ".";
import { ref, nextTick } from "vue";
import xModal from "../xModal/xModal";

const login = ref(null);
const password = ref(null);
let eyeShow = ref(false);

nextTick(() => {
  state.modal = new xModal.create({
    el: "#confirmation",
    height: 360,
    width: 400,
    onOpen() {
      state.modal.setTitle(state.title);
      nextTick(() => login.value.focus());
    },
    onClose() {
      actions.clearState();
      // document.getElementById("edtBarra").focus();
    },
  });
});
</script>

<template>
  <div id="confirmation">
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
              password.focus();
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

          <!-- <button
              :disabled="state.preLoad"
              @click.prevent="actions.submitForm"
              class="btn-success"
            >
              <van-loading size="19px" v-if="state.preLoad" />
              <template v-else>Confirmar</template>
            </button> -->
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

/* .form input {
  outline: 0;
  background: rgba(209, 213, 219, 0.582);
  width: 100%;
  border: 2px solid rgba(156, 163, 175, 1);
  border-radius: 5px;
  margin: 13px 0 9px;
  padding: 15px;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 500;
  color: rgba(55, 65, 81, 1);
} */

/* .form input::placeholder {
  color: rgba(107, 114, 128, 1);
  font-weight: 500;
} */

/* .form input:focus {
  background: rgb(209, 213, 219);
}

.form button {
  margin-top: 7px;
  outline: 0;
  background: #4b6cb7;
  width: 40%;
  border: 0;
  border-radius: 5px;
  padding: 10px;
  color: #ffffff;
  font-size: 15px;
  -webkit-transition: all 0.3 ease;
  transition: all 0.3 ease;
  cursor: pointer;
  font-weight: 600;
} */

/* .buttons {
  display: flex;
  justify-content: space-between;
}

.form button:active {
  background: #395591;
}

.form span {
  font-size: 1.5rem;
  color: #4b6cb7;
  font-weight: 600;
}

.btn-danger {
  background-color: white !important;
  color: black !important;
}

.btn-danger:active {
  background-color: rgba(0, 0, 0, 0.555) !important;
  color: black !important;
} */
</style>
