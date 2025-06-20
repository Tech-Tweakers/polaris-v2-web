<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import axios from "axios";
import { actions, state } from "./chatui";

const chatContainer = ref<HTMLElement | null>(null);

const isRecording = ref(false);
const loading = ref(false);
let mediaRecorder: MediaRecorder;
let chunks: Blob[] = [];

const toggleRecording = async () => {
  if (!isRecording.value) {
    // Iniciar gravação
    chunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => chunks.push(e.data);

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });

      if (audioBlob.size === 0) return;

      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("session_id", state.idChat);

      try {
        loading.value = true;
        const audioUrl = import.meta.env.VITE_API_AUDIO_URL;
        const res = await axios.post(
          `${audioUrl}/audio-inference/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" },
            timeout: 320000,
          }
        );

        const resposta = res.data.resposta;
        const ttsUrl = res.data.tts_audio_url;
        const userAudioUrl = res.data.user_audio_url;

        state.messages.push({
          id: state.messages.length + 1,
          text: "",
          sender: "user",
          timestamp: new Date(),
          audioUrl: userAudioUrl,
        });

        state.messages.push({
          id: state.messages.length + 2,
          text: resposta,
          sender: "bot",
          timestamp: new Date(),
          audioUrl: ttsUrl,
        });
      } catch (err) {
        console.error("❌ Erro ao enviar áudio:", err);
      } finally {
        loading.value = false;
        isRecording.value = false;
      }
    };

    mediaRecorder.start();
    isRecording.value = true;
  } else {
    // Parar gravação manual
    if (mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

watch(
  () => state.messages.length,
  async () => {
    await nextTick();
    scrollToBottom();
  }
);
</script>


<template>
  <v-app>
  <v-app-bar app flat height="42" class="app-bar">
    <div class="titulo-barra">
      <img class="logo" src="../../../public/icons/icon.png" alt="logo" />
      <span class="titulo-texto">Polaris AI v2.1</span>
    </div>
  </v-app-bar>
    <v-main class="main-content">
    <div class="chat-scroll" ref="chatContainer">
      <div
        v-for="message in state.messages"
        :key="message.id"
        class="message"
        :class="{
          'user-message': message.sender === 'user',
          'bot-message': message.sender === 'bot'
        }"
      >
        <div class="message-content">
          <template v-if="message.text && !message.audioUrl">
            <div>{{ message.text }}</div>
          </template>

          <template v-if="message.audioUrl">
            <div style="margin-top: 8px;">
              <audio :src="message.audioUrl" controls class="audio-player" />
            </div>
          </template>

          <template v-if="!message.text && !message.audioUrl">
            <em>⚠️ Mensagem vazia?</em>
          </template>
        </div>
      </div>
    </div>

    <!-- Área de input + rodapé -->
    <div class="fixed-bottom">
      <!-- Input + Botões -->
      <div class="input-bar">
        <v-textarea
          v-model="state.input"
          label="Type a message"
          hide-details
          variant="outlined"
          density="compact"
          rows="1"
          class="flex-grow-1 mr-2 input-small-font"
          style="min-height: 34px;"
          @keydown.enter.exact.prevent="actions.enviarMsg"
        />
        <v-btn color="primary" icon @click="actions.enviarMsg" class="mr-2" height="34" width="34">
          <v-icon>mdi-send</v-icon>
        </v-btn>
        <v-btn
          :loading="loading"
          :color="isRecording ? 'red darken-2' : 'secondary'"
          icon
          @click="toggleRecording"
          height="34"
          width="34"
        >
          <v-icon>{{ isRecording ? 'mdi-stop' : 'mdi-microphone' }}</v-icon>
        </v-btn>
      </div>
    </div>
    </v-main>

    <!-- Overlay de carregamento -->
    <v-overlay :model-value="state.loading" persistent>
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
  </v-app>
</template>

<style lang="scss" scoped>
.app-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; // alto o suficiente
  background-color: #121212 !important;
  box-shadow: none !important;
}

.app-bar::after {
  content: "";
  display: block;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1); // ou um cinzinha
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
}

.titulo-barra {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 20px;
  padding-top: 8px;
  padding-bottom: 8px;
  height: 100%;
  font-size: 16px;
  font-weight: 400;
  box-sizing: border-box;
  margin-right: auto;
}

.drawer {
  background-color: transparent !important; /* Remove a cor de fundo */
  border-right: none !important; /* Remove a borda */
}

.logo {
  width: 23px; /* Tamanho reduzido da logo */
  height: 23px;
  margin-left: 2px;
  margin-bottom: 2px;
}

.main-content {
  padding-top: 42px;
  height: calc(100vh - 42px - 40px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #121212;
  z-index: 10;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
}



.v-footer {
  justify-content: center;
  align-items: center;
  font-size: 8px;
  height: 10px;
  min-height: 20px;
  padding: 0 12px;
}

.chat-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0px 8px 180px 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}



.input-bar {
  display: flex;
  align-items: center;
  padding: 8px;
}



.dark .header {
  background: linear-gradient(
    112.1deg,
    rgb(32, 38, 57) 11.4%,
    rgb(63, 76, 119) 70.2%
  );
}

.chat-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start; // Impede centralização
  padding: 8px;
  flex-grow: 1;
  overflow-y: auto;
  padding-top: 0 !important;
  margin-top: 0 !important;
}

.messageInicial {
  font-size: 17px;
  padding: 0px;
  padding-top: 0 !important;
  margin-top: 0 !important;
}

.message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 240px;
  max-width: 90%;
  font-size: 13px;
  padding: 14px 18px;
  margin: 8px;
  border-radius: 12px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  word-break: break-word;
}



.message-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.bubble {
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 16px;
  max-width: 80ch;
  line-height: 1.6;
  word-wrap: break-word;
}

.bot-message {
  background-color: #2d2d2d;
  color: #fff;
  align-self: flex-start;
  border-radius: 12px 12px 12px 0;
  max-width: 40%;
}

.user-message {
  background-color: #005f63;
  color: #fff;
  align-self: flex-end;
  border-radius: 12px 12px 0 12px;
  max-width: 40%;
}


.waves-container {
  position: relative;
  width: 100%;
  height: 15vh;
  overflow: hidden;
}

.waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.parallax > use {
  animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
  fill: rgba(255, 255, 255, 0.7);
}

.dark .parallax > use:nth-child(1) {
  fill: rgba(32, 38, 57, 0.7);
}

.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
  fill: rgba(255, 255, 255, 0.5);
}

.dark .parallax > use:nth-child(2) {
  fill: rgba(32, 38, 57, 0.5);
}

.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
  fill: rgba(255, 255, 255, 0.3);
}

.dark .parallax > use:nth-child(3) {
  fill: rgba(32, 38, 57, 0.3);
}

.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
  fill: rgba(255, 255, 255, 1);
}

.dark .parallax > use:nth-child(4) {
  fill: rgba(63, 76, 119, 0.8);
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}

.copyright {
  font-size: 11px;
}

.textArea {
  margin-bottom: 100px;
}

.input-area {
  position: absolute;
  background-color: transparent;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.2); // pode ajustar
  backdrop-filter: blur(4px);
  z-index: 2;
}

@media (max-width: 600px) {

  .input-area {
    padding-bottom: 50px;
  }

  .chat-container {
    display: flex;
    flex-direction: column;
    padding: 16px;
    flex-grow: 1;
    overflow-y: auto;
  }

  .message {
    display: inline-block;
    max-width: 70ch;
    font-size: 15px;
    padding: 14px 18px;
    margin: 8px;
    border-radius: 12px;
    line-height: 1.6;
    word-wrap: break-word;
    white-space: pre-wrap;
  }

  .waves {
    height: 10vh;
  }
}

.audio-player {
  width: 100%;
  max-width: 100%;
  min-width: 200px;
  border-radius: 8px;
}


</style>
