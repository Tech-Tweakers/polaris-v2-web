<script setup lang="ts">
import { ref, nextTick } from 'vue';

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

const fileInput = ref<HTMLInputElement | null>(null);

const handleEnter = (event: KeyboardEvent) => {
  if (event.shiftKey || event.metaKey) {
    const target = event.target as HTMLInputElement;
    const cursorPos = target.selectionStart ?? props.modelValue.length;
    const newVal =
      props.modelValue.slice(0, cursorPos) + '\n' + props.modelValue.slice(cursorPos);
    emit('update:modelValue', newVal);
    nextTick(() => {
      target.selectionStart = target.selectionEnd = cursorPos + 1;
    });
  } else {
    event.preventDefault();
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
  <div class="textArea chat-input-wrap">
    <v-textarea
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      placeholder="Pergunte algo"
      variant="plain"
      hide-details
      class="chat-textarea"
      auto-grow
      rows="1"
      :disabled="isRecording || loadingAudio || streaming || uploading"
      :class="{ 'input-bloqueado': isRecording || loadingAudio || streaming || uploading }"
      @keydown.enter="handleEnter"
    />
    <v-btn
      class="chat-action-btn pulse-on-record"
      :loading="loadingAudio"
      :color="
        modelValue?.trim()
          ? 'blue darken-2'
          : isRecording
            ? 'red darken-2'
            : 'teal darken-1'
      "
      icon
      @click="handleDynamicButton"
      :disabled="streaming || uploading"
    >
      <v-icon>
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
      class="chat-action-btn pulse-on-record"
      :loading="uploading"
      :disabled="streaming || loadingAudio || isRecording"
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
</template>

<style scoped>
.chat-input-wrap {
  width: min(860px, 100%);
  margin: 0 auto;
  padding: 10px 12px;
  border-radius: 22px;
}

.chat-textarea {
  flex: 1;
}

.chat-textarea :deep(textarea) {
  max-height: 180px;
  overflow-y: auto;
  line-height: 1.4;
  padding-top: 10px;
}

.chat-textarea :deep(textarea::placeholder) {
  line-height: 1.4;
}

.chat-action-btn {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
}

@media (max-width: 600px) {
  .chat-input-wrap {
    border-radius: 18px;
    padding: 8px 10px;
  }
}
</style>
