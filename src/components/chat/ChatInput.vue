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
  el.style.height = Math.min(el.scrollHeight, 180) + 'px';
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
    <textarea
      ref="textareaRef"
      :value="modelValue"
      @input="onInput"
      @keydown="handleKeydown"
      placeholder="Pergunte algo"
      rows="1"
      :disabled="isRecording || loadingAudio || streaming || uploading"
      :class="{ disabled: isRecording || loadingAudio || streaming || uploading }"
    />
    <div class="chat-input-actions">
      <v-btn
        class="action-btn"
        :loading="loadingAudio"
        :color="isRecording ? 'red darken-2' : '#003f47'"
        icon
        size="small"
        variant="flat"
        @click="handleDynamicButton"
        :disabled="streaming || uploading"
      >
        <v-icon size="20">
          {{
            modelValue?.trim()
              ? 'mdi-send'
              : isRecording
                ? 'mdi-stop'
                : 'mdi-microphone'
          }}
        </v-icon>
      </v-btn>
      <v-btn
        class="action-btn"
        :loading="uploading"
        :disabled="streaming || loadingAudio || isRecording"
        color="#003f47"
        icon
        size="small"
        variant="flat"
        @click="triggerFile"
      >
        <v-icon size="20">mdi-paperclip</v-icon>
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
  width: min(640px, calc(100% - 32px)) !important;
  max-width: 640px !important;
  margin: 0 auto !important;
  padding: 10px 14px;
  border-radius: 24px;
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
  padding: 6px 0;
  min-height: 24px;
  max-height: 180px;
  overflow: hidden;
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
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
}

@media (max-width: 600px) {
  .chat-input-bar {
    border-radius: 18px;
    padding: 8px 10px;
  }
}
</style>
