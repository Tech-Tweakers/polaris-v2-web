import axios from "axios";
import storeLogin from "../pages/login/login";

export default () => {

  if (sessionStorage.getItem(storeLogin.state.nameStorage)) {
    //@ts-ignore
    let isAuth = JSON.parse(sessionStorage.getItem(storeLogin.state.nameStorage));
    storeLogin.state.login = isAuth;


    axios.defaults.headers.common["Authorization"] = isAuth.token;
    storeLogin.actions.setAuth(true);


  }
};
