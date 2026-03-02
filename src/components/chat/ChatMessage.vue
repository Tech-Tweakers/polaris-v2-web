<script setup lang="ts">
import { ref, computed } from 'vue';
import type { IMessage } from '../../interfaces/chatTypes';
import { getSiblingInfo } from '../../composables/useBranchNavigation';
import MarkdownRenderer from './MarkdownRenderer.vue';
import ChatMessageActions from './ChatMessageActions.vue';
import BranchNavigator from './BranchNavigator.vue';

const props = defineProps<{
  message: IMessage;
  allMessages: IMessage[];
  isStreaming?: boolean;
}>();

const emit = defineEmits<{
  regenerate: [msgId: number];
  edit: [payload: { id: number; content: string }];
  switchBranch: [leafNodeId: number];
}>();

const isEditing = ref(false);
const editText = ref('');

const siblingInfo = computed(() => getSiblingInfo(props.message, props.allMessages));

const isTyping = computed(
  () => props.isStreaming && (!props.message.content || props.message.content === 'digitando...')
);

const hasContent = computed(
  () => props.message.content && props.message.content !== 'digitando...'
);

const formatTimestamp = (ts: number) => {
  const date = new Date(ts);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const horas = date.getHours().toString().padStart(2, '0');
  const minutos = date.getMinutes().toString().padStart(2, '0');
  return `${dia}/${mes} - ${horas}:${minutos}`;
};

const startEdit = () => {
  editText.value = props.message.content;
  isEditing.value = true;
};

const submitEdit = () => {
  if (editText.value.trim() && editText.value.trim() !== props.message.content) {
    emit('edit', { id: props.message.id, content: editText.value.trim() });
  }
  isEditing.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
};

const handleBranchPrev = () => {
  const info = siblingInfo.value;
  if (info.currentIndex > 0) {
    emit('switchBranch', info.siblingLeafNodeIds[info.currentIndex - 1]);
  }
};

const handleBranchNext = () => {
  const info = siblingInfo.value;
  if (info.currentIndex < info.siblingLeafNodeIds.length - 1) {
    emit('switchBranch', info.siblingLeafNodeIds[info.currentIndex + 1]);
  }
};
</script>

<template>
  <div
    class="message"
    :class="{
      'user-message': message.role === 'user',
      'bot-message': message.role === 'assistant',
    }"
  >
    <!-- Branch navigator -->
    <BranchNavigator
      :total="siblingInfo.siblingLeafNodeIds.length"
      :current-index="siblingInfo.currentIndex"
      @prev="handleBranchPrev"
      @next="handleBranchNext"
    />

    <!-- Edit mode -->
    <template v-if="isEditing">
      <v-textarea
        v-model="editText"
        auto-grow
        rows="2"
        variant="outlined"
        density="compact"
        hide-details
        class="edit-textarea"
        @keydown.enter.exact.prevent="submitEdit"
        @keydown.escape="cancelEdit"
      />
      <div class="edit-actions">
        <v-btn size="small" variant="text" @click="cancelEdit">Cancelar</v-btn>
        <v-btn size="small" color="primary" variant="tonal" @click="submitEdit">Enviar</v-btn>
      </div>
    </template>

    <!-- Normal display -->
    <template v-else>
      <!-- Text content -->
      <template v-if="hasContent && !message.audioUrl">
        <MarkdownRenderer :content="message.content" />
      </template>

      <!-- Audio -->
      <template v-if="message.audioUrl">
        <audio :src="message.audioUrl" controls class="audio-player" />
      </template>

      <!-- Typing indicator -->
      <template v-if="isTyping">
        <span class="typing-dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </template>

      <!-- Empty fallback -->
      <template v-if="!message.content && !message.audioUrl && !isTyping">
        <em>⚠️ Mensagem vazia?</em>
      </template>

      <!-- Timestamp -->
      <div class="timestamp" v-if="message.timestamp && !isStreaming">
        {{ formatTimestamp(message.timestamp) }}
      </div>

      <!-- Actions (visible on hover) -->
      <ChatMessageActions
        v-if="hasContent && !isStreaming"
        :role="message.role"
        :content="message.content"
        @regenerate="emit('regenerate', message.id)"
        @edit="startEdit"
      />
    </template>
  </div>
</template>

<style scoped>
.edit-textarea {
  width: 100%;
  margin-bottom: 4px;
}
.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.message:hover :deep(.message-actions) {
  opacity: 1;
}
</style>
