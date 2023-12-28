
import stateGlobal from "@/store/globalState";
import actions from "@/store/globalActions";
import axios from "axios";
import storeLogin from "../pages/login/login";
// import router from "@/router";
// import socketClient from "./socketClient";


export default () => {

  if (sessionStorage.getItem(storeLogin.state.nameStorage)) {
    //@ts-ignore
    let isAuth = JSON.parse(sessionStorage.getItem(storeLogin.state.nameStorage));
    storeLogin.state.login = isAuth;
    stateGlobal.empresa = JSON.parse(sessionStorage.getItem('empresa' + stateGlobal.nomeSistema));

    axios.defaults.headers.common["Authorization"] = isAuth.token;
    storeLogin.actions.setAuth(true);


    if (stateGlobal.DATA == '')
      actions.begin();

  }
};
