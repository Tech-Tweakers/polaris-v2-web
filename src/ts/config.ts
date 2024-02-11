import { Socket } from "socket.io-client";

export default {
  socket: <Socket>{},
  PORT: import.meta.env.VITE_PORT || 2002,
  SERVER: import.meta.env.VITE_SERVER,
  API_CEP: '',
};
