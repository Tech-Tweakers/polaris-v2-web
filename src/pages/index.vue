<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { actions, state } from "./polaris";

import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

marked.setOptions({ breaks: true });

declare global {
  interface Window {
    __copyHandlerAdded?: boolean;
  }
}

const renderMarkdown = (text: string = "") => {
  const trimmed = text.trim();
  const normalized = trimmed.replace(/([^\n])\n(?!\n)/g, "$1\n");

  return marked.parse(normalized);
};

marked.use({
  renderer: {
    code({ text, lang }) {
      const validLang = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language: validLang }).value;
      const codeId = `code-${Math.random().toString(36).slice(2, 8)}`;

      return `
        <div class="code-block-wrapper">
          <pre><code id="${codeId}" class="hljs ${validLang}">${highlighted}</code></pre>
        </div>
      `;
    }
  }
});



if (typeof window !== "undefined" && !window.__copyHandlerAdded) {
  window.__copyHandlerAdded = true;
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("copy-hint")) {
      const codeId = target.getAttribute("data-target");
      const codeEl = document.getElementById(codeId ?? "");
      if (codeEl) {
        const textToCopy = codeEl.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
          target.innerText = "copiado!";
          setTimeout(() => (target.innerText = "copiar código"), 1500);
        });
      }
    }
  });
}

const chatContainer = ref<HTMLElement | null>(null);
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

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
    //if (lastMessage?.sender === "bot") scrollToBottom();
    scrollToBottom()
  }
);

const handleDynamicButton = () => {
  if (state.input?.trim()) actions.enviarMsg();
  else actions.toggleRecording();
};

const handleEnter = (event: KeyboardEvent) => {
  if (event.shiftKey || event.metaKey) {
    const target = event.target as HTMLInputElement;
    const cursorPos = target.selectionStart ?? state.input.length;
    state.input =
      state.input.slice(0, cursorPos) + "\n" + state.input.slice(cursorPos);
    nextTick(() => {
      target.selectionStart = target.selectionEnd = cursorPos + 1;
    });
  scrollToBottom();
  } else {
    event.preventDefault();
    actions.enviarMsg();
    scrollToBottom();
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
</script>


<template>
  <v-app>
    <v-main class="main-layout header">
      <v-app-bar app flat height="42" class="app-bar">
        <div class="titulo-barra">
          <img width="30" class="logo" src="../assets/icon.png" alt="logo" />
          <span class="titulo-texto">Polaris v2</span>
        </div>
        <v-spacer />
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
          <!-- tudo dentro do balão -->
          <template v-if="message.text && !message.audioUrl">
            <div class="message-content" v-html="renderMarkdown(message.text)"></div>
          </template>

          <template v-if="message.audioUrl">
            <audio :src="message.audioUrl" controls class="audio-player" />
          </template>

          <template v-if="!message.text && !message.audioUrl">
            <em>⚠️ Mensagem vazia?</em>
          </template>

          <div class="timestamp">{{ formatTimestamp(message.timestamp) }}</div>
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

:root {
  --font-message: clamp(1rem, 1.2vw + 0.5rem, 1.2rem);
  --font-small: clamp(0.75rem, 0.6vw + 0.4rem, 0.875rem);
  --font-title: clamp(1.3rem, 1.5vw + 0.7rem, 1.7rem);
}

* {
  font-family: 'Inter', sans-serif;
}

.v-app-bar {
  height: 50px !important;
  padding: 0 2rem;
}

.titulo-barra {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 60%;
  font-size: 1.4rem;
  margin-bottom: -8px;
  font-weight: 600;
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
  padding-top: 3rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.message {
  font-size: 1rem;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  position: relative;
  max-width: 80%;
  word-break: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
  padding: 0.8rem 1rem;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
}

.user-message {
  align-self: flex-end;
  background-color: #003f47;
  color: #fff;
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
  backdrop-filter: blur(2px);
  border: 0.5px solid rgba(255, 255, 255, 0.08);
  padding: 1rem;
  flex-shrink: 0;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: var(--font-message);
  color: #fff;
  font-family: 'Inter', sans-serif;
  resize: none;
  min-height: 50px;
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
  text-align: right !important;
  align-self: flex-end; // <- ESSENCIAL!
  opacity: 0.4;
}

.user-message .timestamp {
  text-align: right !important;
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
    font-size: 1.5rem;
  }
}

.pulse-on-record {
  background-color: #003f47 !important;
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

.message p {
  margin: 0 0 0.75rem;
  padding: 0;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.message br {
  display: block;
  content: "";
  margin-bottom: 0.5rem;
}

.message .ml-2 {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 100%; // ← ESSA É A CHAVE!
  overflow-x: hidden; // ← evita qualquer escapamento
}


.message .ml-2 > * {
  max-width: 100%;
  overflow-wrap: break-word;
}

.bot-message a {
  color: #42a5f5;
  text-decoration: underline;
}

.code-block-wrapper {
  overflow-x: auto;
  max-width: 100%;
  box-sizing: border-box;
  width: 100%;

  pre {
    white-space: pre;
    font-size: 0.85rem;
    overflow-x: auto;
    background-color: #222;
    border-radius: 8px;
    padding: 1rem;
  }

  code {
    white-space: pre;
    font-size: 0.85rem !important;
  }
}

.copy-hint {
  margin-top: 4px;
  font-size: 0.7rem;
  color: #aaa;
  text-align: left;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #fff;
    text-decoration: underline;
  }
}


.code-block-wrapper:hover .copy-hint {
  opacity: 1;
  pointer-events: auto;
}

@media (max-width: 600px) {
  .chat-container {
    padding: 3rem 1rem 1rem 1rem; // top, right, bottom, left
    max-width: 100%;
  }

  .user-message,
  .bot-message {
    padding: 0.7rem 1rem;
  }

  .titulo-texto {
    font-size: var(--font-message);
  }

  .textArea {
    padding: 0.4rem 0.8rem;
  }

  .code-block-wrapper pre {
    background: #222;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    overflow-x: auto;
    overflow-y: hidden;
    font-size: 0.75rem !important;
    line-height: 1.4;
    white-space: pre;
    box-sizing: border-box;
    margin: 0;
    max-width: 100%;
  }

  .code-block-wrapper code {
  font-family: 'Fira Code', monospace;
  line-height: 1.4;
  font-size: 0.4rem; // ou 0.8rem se quiser mais compacto
  display: inline-block;
  line-height: 1.4;
  background: transparent;
  white-space: pre;
}

  .copy-hint {
    opacity: 1 !important;
    pointer-events: auto !important;
  }
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  overflow-x: auto;
  word-break: break-word;
}

.message.bot-message {
  max-width: 80%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  display: flex;
  flex-direction: column;
}


</style>
