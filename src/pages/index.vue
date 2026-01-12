<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { actions, state } from "./polaris";

import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import '@/styles/polaris.scss';
import axios from "axios";


marked.setOptions({ breaks: true });

declare global {
  interface Window {
    __copyHandlerAdded?: boolean;
  }
}

const renderMarkdown = (text: string = "") => {
  if (!text || text.trim() === '') {
    return '';
  }

  const trimmed = text.trim();
  const normalized = trimmed.replace(/([^\n])\n(?!\n)/g, "$1\n");

  try {
    const html = marked.parse(normalized);
    console.log('Markdown input:', trimmed);
    console.log('Markdown output:', html);
    return html;
  } catch (error) {
    console.error('Erro no parsing Markdown:', error);
    return trimmed; // Fallback para texto simples
  }
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
const fileInput = ref<HTMLInputElement | null>(null);
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

const scrollToBottom = () => {
  if (scrollTimeout) clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  }, 50); // Mais rápido para streaming
};

const scrollToBottomImmediate = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

// Watcher para novas mensagens
watch(
  () => state.messages.length,
  async () => {
    await nextTick();
    scrollToBottom();
  }
);

// Watcher para mudanças no texto das mensagens (streaming)
watch(
  () => state.messages.map(msg => msg.text),
  async (newTexts, oldTexts) => {
    // Só faz scroll se o texto realmente mudou e estamos carregando
    if (state.loading) {
      await nextTick();
      scrollToBottomImmediate();
    }
  },
  { deep: true }
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

const triggerFile = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    actions.enviarArquivo(file);
  }
  // reset para permitir o mesmo nome de arquivo novamente
  if (target) target.value = "";
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
          <template v-if="message.text && !message.audioUrl && message.text !== 'digitando...'">
            <div class="message-content" v-html="renderMarkdown(message.text)"></div>
          </template>

          <template v-if="message.audioUrl">
            <audio :src="message.audioUrl" controls class="audio-player" />
          </template>
          <template v-else-if="message.text === 'digitando...'">
            <span class="typing-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </template>
          <template v-else-if="!message.text && !message.audioUrl">
            <em>⚠️ Mensagem vazia?</em>
          </template>
          <div class="timestamp" v-if="message.timestamp">
            {{ formatTimestamp(message.timestamp) }}
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
          :disabled="state.isRecording || state.loadingAudio || state.streaming || state.uploading"
          :class="{ 'input-bloqueado': state.isRecording || state.loadingAudio || state.streaming || state.uploading }"
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
          :disabled="state.streaming || state.uploading"
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
        <v-btn
          class="ml-2 pulse-on-record"
          :loading="state.uploading"
          :disabled="state.streaming || state.loadingAudio || state.isRecording"
          color="blue darken-2"
          icon
          @click="triggerFile"
        >
          <v-icon>mdi-paperclip</v-icon>
        </v-btn>
        <input
          type="file"
          ref="fileInput"
          accept=".pdf"
          style="display: none"
          @change="handleFileChange"
        />
      </div>
      <!-- overlay removido para permitir ver o streaming -->
    </v-main>
  </v-app>
</template>
