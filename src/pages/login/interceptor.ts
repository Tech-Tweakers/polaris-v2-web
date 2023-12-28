import {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { actions } from "./login";

const onRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
  console.info(`[request] [${JSON.stringify(config)}]`);
  return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  console.error(`[request error] [${JSON.stringify(error)}]`);
  return Promise.reject(error);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
  return response;
};

const onResponseError = (error: AxiosError): Promise<AxiosError> => {
  if (error.hasOwnProperty("response") && error.response != undefined) {
    if (error.response.hasOwnProperty("data")) {
      if (error.response.data.hasOwnProperty("msg")) {
        if (
          error.response.data.msg.indexOf("Token Inválido") > -1 ||
          error.response.data.msg.indexOf("TokenExpiredError") > -1
        ) {
          actions.logOut();
        } else {
          return Promise.reject(error);
        }
      }
    }
  }

  return Promise.reject(error);
};

export function setupInterceptorsTo(axiosInstance: AxiosInstance) {
  // axiosInstance.interceptors.request.use(onRequest, onRequestError);
  axiosInstance.interceptors.response.use(onResponse, onResponseError);
}

// export default () => {
//     axios.interceptors.response.use(
//         res => {

//             if (res.data.error) {
//                 util.show({
//                     msg: res.data.error, onClose: () => {
//                         logout()
//                     }
//                 })
//                 return false
//             }
//             return res;
//         },
//         error => {

//             if (error.response.status == '400')
//                 router.push("/");

//             try {
//                 if (error.response.status == '401')
//                     logout(error)
//             } catch (er) {
//                 logout(er)
//             }

//             return error;
//         }
//     );
// }
