<script setup lang="ts">
import globalActions from "@/store/globalActions";
import { ref, watch, nextTick } from "vue";
import { actions, state } from "./polaris";

const chatContainer = ref<HTMLElement | null>(null);

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
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage?.sender === "bot") {
      scrollToBottom();
    }
  }
);
</script>

<template>
  <v-btn
    @click="globalActions.toggleTheme()"
    variant="text"
    class="btnDark"
    color="primary"
    icon="mdi-theme-light-dark"
  ></v-btn>

  <v-app>
    <v-main class="main-layout header">
      <v-app-bar app flat height="42" class="app-bar">
        <div class="titulo-barra">
          <img
            width="25"
            class="logo"
            src="../../../public/icons/icon.png"
            alt="logo"
          />
          <span class="titulo-texto">Polaris AI v2.1</span>
        </div>
      </v-app-bar>

      <div class="chat-container" ref="chatContainer">
        <div
          v-for="message in state.messages"
          :key="message.id"
          class="message"
          :class="{
            'user-message': message.sender === 'user',
            'bot-message': message.sender === 'bot',
          }"
        >
          <div>
            <template v-if="message.text && !message.audioUrl">
              <span class="ml-2">{{ message.text }}</span>
            </template>

            <template v-if="message.audioUrl">
              <div style="margin-top: 8px">
                <audio :src="message.audioUrl" controls class="audio-player" />
              </div>
            </template>

            <template v-if="!message.text && !message.audioUrl">
              <em class="ml-2">⚠️ Mensagem vazia?</em>
            </template>
          </div>
        </div>
      </div>

      <div class="textArea pa-4">
        <v-textarea
          ref="textAreaRef"
          v-model="state.input"
          label="Pergunte algo"
          hide-details
          rows="3"
          class="rounded"
          @keydown.enter.prevent="actions.enviarMsg"
        >
          <template #append>
            <v-btn @click="actions.enviarMsg" color="primary" icon>
              <v-icon>mdi-send</v-icon>
            </v-btn>
            <v-btn
              class="ml-2"
              :loading="state.loadingAudio"
              :color="state.isRecording ? 'red darken-2' : 'secondary'"
              icon
              @click="actions.toggleRecording"
              height="50"
              width="50"
            >
              <v-icon>{{
                state.isRecording ? "mdi-stop" : "mdi-microphone"
              }}</v-icon>
            </v-btn>
          </template>
        </v-textarea>
      </div>

      <div class="d-flex justify-center align-center flex-column">
        <p class="text-caption">© Polaris AI v2.1 2025</p>
      </div>
      <v-overlay
        :model-value="state.loading"
        class="align-center justify-center"
        persistent
      >
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        ></v-progress-circular>
      </v-overlay>
    </v-main>
  </v-app>
</template>

<style scoped lang="scss">
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

.btnDark {
  position: fixed;
  right: 16px;
  z-index: 1000;
}

.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--v-theme-background);
  overflow: hidden;
}

.header {
  padding: 2rem 1rem 1rem;
  text-align: center;
  flex-shrink: 0;
}

// .dark .header {
//   background: linear-gradient(112.1deg, #202639 11.4%, #3f4c77 70.2%);
// }

.chat-container {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 1rem 2rem;
  padding-top: 50px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  font-size: 1rem;
  line-height: 1.5;
  display: flex;
  align-items: center;
  text-align: left;
}

.user-message {
  align-self: flex-end;
  background-color: rgba(0, 172, 193, 0.2);
  border-radius: 12px;
  padding: 0.5rem 1rem;
}

.bot-message {
  align-self: flex-start;
  background-color: rgba(255, 255, 255, 0.08);
  padding: 0.5rem 1rem;
  align-self: flex-start;
  border-radius: 12px 12px 12px 0;
  max-width: 85%;
}

.textArea {
  background-color: rgba(255, 255, 255, 0.06);
  padding: 1rem;
  flex-shrink: 0;
  border-radius: 20px;
}

.dark .content {
  background-color: #38446b;
  color: #ddd;
}

.audio-player {
  width: 100%;
  max-width: 100%;
  min-width: 200px;
  border-radius: 8px;
}
</style>
