import axios from "axios";
import { reactive } from "vue";
import router from "../../router";
import { iLogin } from "../../models/interfaces";
import stateGlobal from '@/store/globalState'
import swal from 'sweetalert2'

export const state = reactive({
  nameStorage: "isAuth-" + stateGlobal.nomeSistema,
  login: <iLogin>{},
  auth: false,
  btnLoad: false,
});

export const actions = {
  setLogin(login: {
    email: string;
    id_master: string;
    name: string;
    phone: string;
    token: string;
  }) {
    //@ts-ignore
    state.login = login;
  },

  setAuth(auth: boolean) {
    state.auth = auth;
  },

  getCPF() {
    if (state.login.CPF)
      return state.login.CPF.replaceAll(".", "").replaceAll("-", "");
  },

  formatarPermissoes() {
    let permissoes = localStorage.getItem("configuracoes" + stateGlobal.nomeSistema);
    let json = JSON.parse(permissoes);
    for (let i in json) {
      json[i] = json[i].permissao;
      delete json[i].permissao;
      delete json[i].descricao;
    }
    return json
  },



  logOut() {
    sessionStorage.removeItem("empresa" + stateGlobal.nomeSistema);
    sessionStorage.removeItem(state.nameStorage);
    sessionStorage.removeItem(stateGlobal.nomeSistema);

    this.setLogin({
      email: "",
      id_master: "",
      name: "",
      phone: "",
      token: "",
    });

    axios.defaults.headers.common["Authorization"] = null;

    this.setAuth(false);

    // socketClient.disconnect();

    router.push("/login");
    window.location.reload();
  },

  async confirmarSaida() {

    let rs = await swal.fire({
      title: 'Sair do Sistema',
      text: "Deseja sair do sistema?",
      icon: 'question',
      confirmButtonText: 'Sim',
      showCancelButton: true,
      cancelButtonText: 'Não',
      cancelButtonColor: '#ccdce3',
    })

    if (rs.isConfirmed)
      actions.logOut();
  }
};

export default {
  state,
  actions,
};
