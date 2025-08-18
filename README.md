## 🌌 Polaris v2 – Web Client

Frontend oficial do projeto **Polaris v2**, interface Vue.js minimalista, responsiva e com suporte a entrada de texto e voz, conexão direta com o backend da API Polaris (FastAPI) e suporte a resposta com áudio.

---

### 🛠️ Tecnologias Utilizadas

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Vuetify 3](https://vuetifyjs.com/)
- [Axios](https://axios-http.com/)
- [Marked](https://marked.js.org/) + [highlight.js](https://highlightjs.org/)
- [Electron (opcional)](https://www.electronjs.org/) para empacotamento desktop

---

### ⚙️ Funcionalidades

- ✅ Interface de chat limpa e responsiva
- 🧠 Integração com API de inferência (`/inference/`)
- 🔊 Suporte a entrada por **voz (webm)** e reprodução da resposta em áudio (`/audio-inference/`)
- 📜 Renderização de **markdown com destaque de sintaxe**
- 🧠 `session_id` persistente por `sessionStorage`
- 🔄 Reconhecimento de respostas pendentes via `/inference/pending-response/` *(suporte opcional)*
- 💬 Detecção automática de mensagens vazias / feedback de erro

---

### 🧪 Variáveis de Ambiente

Crie um `.env` ou `.env.local` com as seguintes variáveis (pode ajustar conforme sua infra):

```env
VITE_API_TEXT_URL=http://localhost:8000
VITE_API_AUDIO_URL=http://localhost:8010
```

> 📌 `VITE_API_TEXT_URL` aponta para o backend principal da Polaris API.  
> 📌 `VITE_API_AUDIO_URL` aponta para o backend de integração com TTS e gravação.

---

### 🚀 Como Rodar Localmente

```bash
# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
npm run dev
```

> Por padrão, o app estará disponível em `http://localhost:5173/`

---

### 📦 Empacotar para Desktop (Electron)

```bash
# Gerar versão desktop (Linux ou Windows)
npm run app:build
# Ou:
npm run app:buildWin
```

---

### 📤 Comunicação com a API

#### 1. Texto para texto
```http
POST /inference/

{
  "prompt": "Qual é a capital do Brasil?",
  "session_id": "abc123"
}
```

#### 2. Áudio para resposta com TTS
```http
POST /audio-inference/

Content-Type: multipart/form-data

- audio: arquivo .webm
- session_id: "abc123"
```

Resposta:
```json
{
  "resposta": "A capital do Brasil é Brasília.",
  "tts_audio_url": "http://.../audio/response.mp3",
  "user_audio_url": "http://.../audio/input.webm"
}
```


