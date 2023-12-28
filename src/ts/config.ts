import { Socket } from "socket.io-client";



export default {
  socket: <Socket>{},
  PORT: import.meta.env.VITE_PORT || 2002,
  SERVER: import.meta.env.VITE_SERVER || "http://192.168.100.200",
  SERVER_IMG: import.meta.env.VITE_SERVER_IMG || "http://www.reallatas.com.br/balcao/foto/",
  SERVER_IMG_FUNCIONARIOS: 'http://www.reallatas.com.br/foto_funcionarios/',
  SERVER_IMG_THUMB: import.meta.env.VITE_SERVER_IMG_THUMB || "http://www.reallatas.com.br/_serverAPP/thumb.php?img=http://www.reallatas.com.br/balcao/foto/",
  API_RECEITA: 'https://www.receitaws.com.br/v1/cnpj/',
  API_CEP: '',
};
