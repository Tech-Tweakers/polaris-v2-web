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
</script>

<template>
  <v-app>
    <ChatSidebar />
    <v-main class="main-layout header">
      <v-app-bar app flat height="42" class="app-bar">
        <v-btn
          icon
          size="small"
          variant="text"
          @click="chatState.sidebarOpen = !chatState.sidebarOpen"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <div class="titulo-barra">
          <img width="30" class="logo" src="../assets/icon.png" alt="logo" />
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
      </v-app-bar>

      <!-- Empty state -->
      <div
        v-if="!chatState.currentConvId"
        class="empty-state"
      >
        <img width="64" src="../assets/icon.png" alt="logo" style="opacity: 0.5" />
        <p>Olá! Comece uma nova conversa.</p>
        <v-btn
          color="teal darken-1"
          variant="tonal"
          @click="chatActions.createNewChat()"
        >
          <v-icon start>mdi-plus</v-icon>
          Nova conversa
        </v-btn>
      </div>

      <!-- Chat area -->
      <template v-else>
        <div class="chat-container" ref="chatContainer">
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

        <ChatInput
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
      </template>
    </v-main>
  </v-app>
</template>

<style scoped>
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #888;
  font-size: 1.1rem;
}
</style>
