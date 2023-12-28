import utils, { block } from "@/ts/utils";
import axios from "axios";
import { reactive } from "vue";
import { Notyf } from "notyf";
import { iModalCreate } from '@/plugins/xModal/xModal'
import Swal from "sweetalert2";
// import notifications from '@/plugins/notifications';

const notyf = new Notyf();

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
        call: "getManager",
        param: {
          cod_funcionario: state.cod_funcionario,
          senha: block(state.senha),
        },
      };

      state.preLoad = true;

      const { data } = await axios.post("xAuthManager", param);

      // let login = document.getElementById("login");

      state.preLoad = false;

      if (!data.token) {
        // notifications.error(data.error, 'login', true)
        await Swal.fire({
          text: data.error,
          icon: "error",
        });
        document.getElementById('login').focus()
        return;
      }

      if (data.warning) {
        // notifications.error(data.warning)
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
