<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { actions, state } from "./polaris";

import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import '@/styles/polaris.scss';

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
