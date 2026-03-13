<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  role: 'user' | 'assistant' | 'system';
  content: string;
}>();

const emit = defineEmits<{
  copy: [];
  regenerate: [];
  edit: [];
}>();

const copied = ref(false);

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(props.content);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = props.content;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
  emit('copy');
};
</script>

<template>
  <div class="message-actions">
    <v-btn
      icon
      size="x-small"
      variant="text"
      :title="copied ? 'Copiado!' : 'Copiar'"
      @click="copyContent"
    >
      <v-icon size="14">{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
    </v-btn>

    <v-btn
      v-if="role === 'assistant'"
      icon
      size="x-small"
      variant="text"
      title="Regenerar"
      @click="emit('regenerate')"
    >
      <v-icon size="14">mdi-refresh</v-icon>
    </v-btn>

    <v-btn
      v-if="role === 'user'"
      icon
      size="x-small"
      variant="text"
      title="Editar"
      @click="emit('edit')"
    >
      <v-icon size="14">mdi-pencil</v-icon>
    </v-btn>
  </div>
</template>

<style scoped>
.message-actions {
  display: flex;
  gap: 2px;
  opacity: 0.4;
  transition: opacity 0.2s;
}
.message-actions:hover {
  opacity: 1;
}
.message-actions :deep(.v-btn) {
  background: transparent !important;
  box-shadow: none !important;
}
.message-actions :deep(.v-btn:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}
</style>
