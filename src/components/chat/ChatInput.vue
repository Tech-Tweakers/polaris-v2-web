<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
  isRecording?: boolean;
  loadingAudio?: boolean;
  streaming?: boolean;
  uploading?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  send: [text: string];
  fileUpload: [file: File];
  toggleRecording: [];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const autoResize = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = 'auto';
  const newHeight = Math.min(el.scrollHeight, 180);
  el.style.height = newHeight + 'px';
  el.style.overflowY = el.scrollHeight > 180 ? 'auto' : 'hidden';
};

watch(() => props.modelValue, () => {
  nextTick(autoResize);
});

const onInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.metaKey) {
    e.preventDefault();
    if (props.modelValue.trim()) {
      emit('send', props.modelValue.trim());
    }
  }
};

const handleDynamicButton = () => {
  if (props.modelValue?.trim()) {
    emit('send', props.modelValue.trim());
  } else {
    emit('toggleRecording');
  }
};

const triggerFile = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) emit('fileUpload', file);
  if (target) target.value = '';
};
</script>

<template>
  <div class="chat-input-bar">
    <v-menu location="top start" :close-on-content-click="true">
      <template #activator="{ props: menuProps }">
        <v-btn
          class="action-btn action-btn--left"
          :disabled="streaming || loadingAudio || isRecording"
          icon
          size="small"
          variant="text"
          v-bind="menuProps"
        >
          <v-icon size="20">mdi-plus</v-icon>
        </v-btn>
      </template>
      <v-list density="compact" bg-color="#2f2f2f" rounded="lg" class="attach-menu">
        <v-list-item @click="triggerFile" prepend-icon="mdi-file-pdf-box" title="Enviar arquivo" />
      </v-list>
    </v-menu>
    <textarea
      ref="textareaRef"
      :value="modelValue"
      @input="onInput"
      @keydown="handleKeydown"
      placeholder="Pergunte alguma coisa"
      rows="1"
      :disabled="isRecording || loadingAudio || streaming || uploading"
      :class="{ disabled: isRecording || loadingAudio || streaming || uploading }"
    />
    <div class="chat-input-actions">
      <v-btn
        v-if="!modelValue?.trim()"
        class="action-btn"
        :loading="loadingAudio"
        :color="isRecording ? 'red darken-2' : 'transparent'"
        icon
        size="small"
        variant="text"
        @click="emit('toggleRecording')"
        :disabled="streaming || uploading"
      >
        <v-icon size="20">{{ isRecording ? 'mdi-stop' : 'mdi-microphone' }}</v-icon>
      </v-btn>
      <v-btn
        v-if="modelValue?.trim()"
        class="action-btn action-btn--send"
        icon
        size="small"
        variant="flat"
        @click="emit('send', modelValue.trim())"
        :disabled="streaming || uploading"
      >
        <v-icon size="18">mdi-arrow-up</v-icon>
      </v-btn>
    </div>
    <input
      type="file"
      ref="fileInput"
      accept=".pdf"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<style scoped>
.chat-input-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 6px !important;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-input-bar textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  padding: 6px 4px;
  min-height: 24px;
  max-height: 180px;
  overflow-y: hidden;
}

.chat-input-bar textarea::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.chat-input-bar textarea.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.chat-input-actions {
  display: flex;
  align-items: center !important;
  gap: 4px;
  flex-shrink: 0;
  margin-bottom: 0;
}

.action-btn {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  color: #b0b0b0 !important;
}
.action-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}
.action-btn--left {
  color: #b0b0b0 !important;
}
.action-btn--send {
  background-color: #fff !important;
  color: #212121 !important;
}
.action-btn--send:hover {
  background-color: #e0e0e0 !important;
}

.attach-menu :deep(.v-list-item) {
  color: #e0e0e0 !important;
  font-size: 0.875rem;
  min-height: 40px;
}
.attach-menu :deep(.v-list-item:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
}

@media (max-width: 600px) {
  .chat-input-bar {
    border-radius: 18px;
    padding: 8px 10px;
  }
}
</style>
