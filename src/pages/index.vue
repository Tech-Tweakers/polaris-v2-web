<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { chatState, chatActions } from '../composables/useChat';
import ChatSidebar from '../components/chat/ChatSidebar.vue';
import ChatMessage from '../components/chat/ChatMessage.vue';
import ChatInput from '../components/chat/ChatInput.vue';
import '@/styles/polaris.scss';

const chatContainer = ref<HTMLElement | null>(null);
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

onMounted(async () => {
  await chatActions.init();
});

const scrollToBottom = () => {
  if (scrollTimeout) clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  }, 50);
};

const scrollToBottomImmediate = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

watch(
  () => chatState.visibleMessages.length,
  async () => {
    await nextTick();
    scrollToBottom();
  }
);

watch(
  () => chatState.visibleMessages.map((msg) => msg.content),
  async () => {
    if (chatState.streaming) {
      await nextTick();
      scrollToBottomImmediate();
    }
  },
  { deep: true }
);

const handleSend = (text: string) => {
  chatActions.sendMessage(text);
  scrollToBottom();
};

const isLastMessage = (msg: { id: number }) => {
  const msgs = chatState.visibleMessages;
  return msgs.length > 0 && msgs[msgs.length - 1].id === msg.id;
};

const hasMessages = () => chatState.visibleMessages.length > 0;
</script>

<template>
  <v-app>
    <ChatSidebar />
    <v-main class="main-layout header">
      <v-app-bar app flat height="54" class="app-bar">
        <template #default>
          <div class="app-bar-content">
            <v-btn
              icon
              size="small"
              variant="text"
              @click="chatState.sidebarOpen = !chatState.sidebarOpen"
            >
              <v-icon>mdi-menu</v-icon>
            </v-btn>
            <div class="titulo-barra">
              <img width="34" class="logo" src="../assets/icon.png" alt="logo" />
              <span class="titulo-texto">Polaris v2</span>
            </div>
            <v-spacer />
            <v-btn
              icon
              size="small"
              variant="text"
              title="Nova conversa"
              @click="chatActions.createNewChat()"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>
        </template>
      </v-app-bar>

      <section class="chat-shell" :class="{ 'chat-shell--empty': !hasMessages() }">
        <div v-if="hasMessages()" class="chat-container" ref="chatContainer">
          <ChatMessage
            v-for="message in chatState.visibleMessages"
            :key="message.id"
            :message="message"
            :all-messages="chatState.allMessages"
            :is-streaming="chatState.streaming && isLastMessage(message)"
            @regenerate="chatActions.regenerateResponse($event)"
            @edit="chatActions.editUserMessage($event.id, $event.content)"
            @switch-branch="chatActions.switchBranch($event)"
          />
        </div>
        <div v-else class="empty-state">
          <img width="56" src="../assets/icon.png" alt="logo" style="opacity: 0.55" />
          <p class="empty-title">Como posso ajudar hoje?</p>
          <p class="empty-subtitle">Envie uma pergunta para iniciar a conversa.</p>
        </div>

        <ChatInput
          class="chat-input"
          v-model="chatState.input"
          :disabled="chatState.streaming || chatState.uploading"
          :is-recording="chatState.isRecording"
          :loading-audio="chatState.loadingAudio"
          :streaming="chatState.streaming"
          :uploading="chatState.uploading"
          @send="handleSend"
          @file-upload="chatActions.enviarArquivo($event)"
          @toggle-recording="chatActions.toggleRecording()"
        />
      </section>
    </v-main>
  </v-app>
</template>

<style scoped>
.chat-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 56px 12px 12px;
}

.chat-shell--empty {
  justify-content: center;
  padding-bottom: 24vh;
}

.chat-input {
  width: 100%;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #9d9d9d;
  margin-bottom: 20px;
  text-align: center;
}

.empty-title {
  font-size: 1.4rem;
  color: #e6e6e6;
  margin-top: 8px;
}

.empty-subtitle {
  font-size: 0.95rem;
  margin: 0;
}

@media (max-width: 960px) {
  .chat-shell {
    padding: 56px 10px 10px;
  }

  .chat-shell--empty {
    padding-bottom: 16vh;
  }
}
</style>
