import { Socket } from "socket.io-client";

export default {
  socket: <Socket>{},
  PORT: import.meta.env.VITE_PORT || 2002,
  SERVER: import.meta.env.VITE_SERVER,
  API_CEP: '',
  // Configurações JWT
  API_TOKEN: import.meta.env.VITE_API_TOKEN || "G#o1tj67G6^0Ok53KGfIPoSB",
  API_BASE_URL: import.meta.env.VITE_API_TEXT_URL || 'http://localhost:8000',
  API_AUDIO_URL: import.meta.env.VITE_API_AUDIO_URL || 'http://localhost:8010',
};
