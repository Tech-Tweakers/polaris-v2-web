<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { actions, state } from "./polaris";

import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // ou o tema que preferir

marked.setOptions({
  breaks: true,
});

const renderMarkdown = (text: string = "") => {
  return marked.parse(text);
};

marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const validLang = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language: validLang }).value;
      return `<pre><code class="hljs ${validLang}">${highlighted}</code></pre>`;
    }
  }
});

const chatContainer = ref<HTMLElement | null>(null);
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

const handleDynamicButton = () => {
  if (state.input?.trim()) {
    actions.enviarMsg();
  } else {
    actions.toggleRecording();
  }
};

const formatTimestamp = (ts: string | Date) => {
  const date = typeof ts === "string" ? new Date(ts) : ts;

  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const horas = date.getHours().toString().padStart(2, "0");
  const minutos = date.getMinutes().toString().padStart(2, "0");

  return `${dia}/${mes} - ${horas}:${minutos}`;
};


const scrollToBottom = () => {
  if (scrollTimeout) clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  }, 100);
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

const handleEnter = (event: KeyboardEvent) => {
  if (event.shiftKey || event.metaKey) {
    // Ctrl + Enter (ou Cmd + Enter no Mac) → ignora, insere quebra de linha
    const target = event.target as HTMLInputElement;
    const cursorPos = target.selectionStart ?? state.input.length;
    state.input =
      state.input.slice(0, cursorPos) + "\n" + state.input.slice(cursorPos);
    nextTick(() => {
      target.selectionStart = target.selectionEnd = cursorPos + 1;
    });
  } else {
    // Enter simples → envia
    event.preventDefault();
    actions.enviarMsg();
  }
};

</script>

<template>
  <v-app>
    <v-main class="main-layout header">
      <v-app-bar app flat height="42" class="app-bar">
        <div class="titulo-barra">
          <img width="25" class="logo" src="../assets/icon.png" alt="logo" />
          <span class="titulo-texto">Polaris AI v2.1</span>
        </div>
        <v-spacer />
        <!-- <v-btn
          @click="globalActions.toggleTheme()"
          variant="text"
          color="primary"
          icon="mdi-theme-light-dark"
        /> -->
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
              <span class="ml-2" v-html="renderMarkdown(message.text)"></span>

              <div class="timestamp">
                {{ formatTimestamp(message.timestamp) }}
              </div>
            </template>
            <template v-if="message.audioUrl">
              <div style="margin-top: 8px">
                <audio :src="message.audioUrl" controls class="audio-player" />
              </div>
              <div class="timestamp">
                {{ formatTimestamp(message.timestamp) }}
              </div>
            </template>

            <template v-if="!message.text && !message.audioUrl">
              <em class="ml-2">⚠️ Mensagem vazia?</em>
            </template>
          </div>
        </div>
      </div>

      <div class="textArea pa-4 d-flex align-center">
        <v-textarea
          v-model="state.input"
          label="Pergunte algo"
          hide-details
          class="flex-grow-1 mr-2"
          auto-grow
          rows="1"
          :disabled="state.isRecording || state.loadingAudio"
          :class="{ 'input-bloqueado': state.isRecording || state.loadingAudio }"
          @keydown.enter="handleEnter"
        />

        <v-btn
          class="ml-2 pulse-on-record"
          :loading="state.loadingAudio"
          :color="state.input?.trim()
            ? 'blue darken-2'
            : (state.isRecording ? 'red darken-2' : 'teal darken-1')"
          icon
          @click="handleDynamicButton"
        >
          <v-icon>
            {{
              state.input?.trim()
                ? 'mdi-send'
                : state.isRecording
                ? 'mdi-stop'
                : 'mdi-microphone'
            }}
          </v-icon>
        </v-btn>

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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

.titulo-barra {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 20px;
  padding-top: 8px;
  padding-bottom: 8px;
  height: 100%;
  font-size: 20px;
  font-weight: 500;
  box-sizing: border-box;
  margin-right: auto;
}

.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to bottom right, #1e1e1e, #111111);
  overflow: hidden;
}

.header {
  padding: 2rem 1rem 1rem;
  text-align: center;
  flex-shrink: 0;
}

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
  font-size: 1.2rem;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  text-align: left;
  position: relative;
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  word-wrap: break-word;
  word-break: break-word;
}

.user-message {
  align-self: flex-end;
  background-color: #003f47;
  color: #d1faff;
  border-bottom-right-radius: 4px;

  &::after {
    content: "";
    position: absolute;
    right: -8px;
    top: 10px;
    border: 8px solid transparent;
    border-left-color: #003f47;
  }
}

.bot-message {
  align-self: flex-start;
  background-color: #2c2c2c;
  color: #f5f5f5;
  border-bottom-left-radius: 4px;

  &::after {
    content: "";
    position: absolute;
    left: -8px;
    top: 10px;
    border: 8px solid transparent;
    border-right-color: #2c2c2c;
  }
}

.textArea {
  background-color: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1rem;
  flex-shrink: 0;
  border-radius: 20px;
}

.input-bloqueado input {
  cursor: not-allowed !important;
  opacity: 0.5;
  background-color: #222 !important;
  color: #aaa !important;
}


.audio-player {
  width: 100%;
  max-width: 100%;
  min-width: 200px;
  border-radius: 8px;
}

.timestamp {
  font-size: 0.6rem;
  color: #aaa;
  margin-top: 4px;
  text-align: right;
  opacity: 0.4;
}

.user-message .timestamp {
  text-align: right;
}


.v-btn {
  border-radius: 50%;
  width: 48px;
  height: 48px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease-in-out;
  background-color: #1f1f1f;
  color: white;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .v-icon {
    font-size: 20px;
  }
}

.pulse-on-record {
  background-color: #b71c1c !important;
  animation: pulse 1.2s infinite ease-in-out;
}

.pulse-on-record:not([style*="red"]) {
  animation: none;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.75;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .chat-container {
    padding: 0.2rem 1rem;
    padding-top: 30px !important;
  }

  .user-message,
  .bot-message {
    font-size: 0.8rem;
    padding: 0.6rem 0.9rem;
  }

  .titulo-texto {
    font-size: 16px;
  }

  .textArea {
    padding: 0.2rem;
  }
}

.bot-message span {
  display: block;
  white-space: pre-wrap;

  code {
    background: #444;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
  }

  pre {
    background: #222;
    padding: 0.5rem;
    border-radius: 6px;
    overflow-x: auto;
  }

  a {
    color: #42a5f5;
    text-decoration: underline;
  }
}

</style>
