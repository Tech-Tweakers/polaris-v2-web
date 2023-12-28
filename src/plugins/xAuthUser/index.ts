import { block } from "@/ts/utils";
import axios from "axios";
import { reactive } from "vue";
import { iModalCreate } from '@/plugins/xModal/xModal'
import Swal from "sweetalert2";

export const state = reactive({
  preLoad: false,
  title: "",
  cod_funcionario: "",
  senha: "",
  modal: <iModalCreate>{}
});

let fnCall: any

export const actions = {
  closeModal() {
    state.modal.close();
    state.cod_funcionario = "";
    state.senha = "";
  },

  clearState() {
    state.cod_funcionario = "";
    state.senha = "";
  },

  async submitForm() {

    if (state.preLoad) return

    try {
      let param = {
        call: "getLogin",
        param: {
          cod_funcionario: state.cod_funcionario,
          senha: block(state.senha),
        },
      };

      state.preLoad = true;

      const { data } = await axios.post("login", param);

      state.preLoad = false;

      if (!data.token) {
        await Swal.fire({
          text: data.error,
          icon: "error",
        });

        document.getElementById('login').focus()
        return;
      }

      if (data.warning) {
        await Swal.fire({
          text: data.warning,
          icon: "warning",
        });
      }

      await fnCall({ data: data.token, cod_funcionario: state.cod_funcionario })

      state.modal.close();

    } catch (error: any) {
    }
  },
};

/**
 * @returns token
 * @description no token tem o código, nome, cpf do funcionario, o token é válido por 30 segundos
 */
export default (title: string, call: Function) => {
  state.title = title
  state.modal.open();
  fnCall = call;
};
