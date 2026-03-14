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
    class="message-wrapper"
    :class="{
      'message-wrapper--user': message.role === 'user',
      'message-wrapper--bot': message.role === 'assistant',
    }"
  >
    <!-- Branch navigator -->
    <BranchNavigator
      :total="siblingInfo.siblingLeafNodeIds.length"
      :current-index="siblingInfo.currentIndex"
      @prev="handleBranchPrev"
      @next="handleBranchNext"
    />

    <!-- User message: bubble + footer outside -->
    <template v-if="message.role === 'user'">
      <div class="message user-message">
        <template v-if="isEditing">
          <v-textarea
            v-model="editText"
            auto-grow
            rows="2"
            variant="plain"
            density="compact"
            hide-details
            class="edit-textarea"
            @keydown.enter.exact.prevent="submitEdit"
            @keydown.escape="cancelEdit"
          />
          <div class="edit-actions">
            <v-tooltip text="Cancelar" location="bottom">
              <template #activator="{ props: tip }">
                <v-btn v-bind="tip" class="edit-btn" icon size="x-small" variant="text" @click="cancelEdit">
                  <v-icon size="16">mdi-close</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Enviar" location="bottom">
              <template #activator="{ props: tip }">
                <v-btn v-bind="tip" class="edit-btn edit-btn--send" icon size="x-small" variant="flat" @click="submitEdit">
                  <v-icon size="16">mdi-arrow-up</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
        <template v-else>
          <template v-if="hasContent && !message.audioUrl">
            <MarkdownRenderer :content="message.content" />
          </template>
          <template v-if="message.audioUrl">
            <audio :src="message.audioUrl" controls class="audio-player" />
          </template>
        </template>
      </div>
      <!-- Footer OUTSIDE the bubble -->
      <div class="message-footer message-footer--user" v-if="hasContent && !isStreaming && !isEditing">
        <ChatMessageActions
          :role="message.role"
          :content="message.content"
          @edit="startEdit"
        />
      </div>
    </template>

    <!-- Bot message: no bubble, content directly -->
    <template v-else>
      <div class="message bot-message">
        <template v-if="hasContent && !message.audioUrl">
          <MarkdownRenderer :content="message.content" />
        </template>
        <template v-if="message.audioUrl">
          <audio :src="message.audioUrl" controls class="audio-player" />
        </template>
        <template v-if="isTyping">
          <span class="typing-dots">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </template>
        <template v-if="!message.content && !message.audioUrl && !isTyping">
          <em>Mensagem vazia</em>
        </template>
      </div>
      <!-- Footer below bot message -->
      <div class="message-footer message-footer--bot" v-if="hasContent && !isStreaming">
        <ChatMessageActions
          :role="message.role"
          :content="message.content"
          @regenerate="emit('regenerate', message.id)"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.message-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.message-wrapper--user {
  align-items: flex-end;
}
.message-wrapper--bot {
  align-items: flex-start;
}
.edit-textarea {
  width: 100%;
  margin-bottom: 4px;
}
.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0;
  margin-top: 4px;
}
.edit-btn {
  width: 30px !important;
  height: 30px !important;
  min-width: 30px !important;
  border-radius: 6px !important;
  background: transparent !important;
  box-shadow: none !important;
  color: #b0b0b0 !important;
}
.edit-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}
.edit-btn--send {
  background-color: #fff !important;
  color: #212121 !important;
}
.edit-btn--send:hover {
  background-color: #e0e0e0 !important;
}
.message-footer--user {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.25rem;
}
.message-footer--bot {
  display: flex;
  justify-content: flex-start;
  margin-top: -0.25rem;
}
.message-wrapper:hover :deep(.message-actions) {
  opacity: 0.8;
}
</style>
