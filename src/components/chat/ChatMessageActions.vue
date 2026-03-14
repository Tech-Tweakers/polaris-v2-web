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
    <v-tooltip :text="copied ? 'Copiado!' : 'Copiar'" location="bottom">
      <template #activator="{ props: tip }">
        <v-btn
          v-bind="tip"
          icon
          size="x-small"
          variant="text"
          @click="copyContent"
        >
          <v-icon size="16">{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip v-if="role === 'assistant'" text="Regenerar" location="bottom">
      <template #activator="{ props: tip }">
        <v-btn
          v-bind="tip"
          icon
          size="x-small"
          variant="text"
          @click="emit('regenerate')"
        >
          <v-icon size="16">mdi-refresh</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip v-if="role === 'user'" text="Editar" location="bottom">
      <template #activator="{ props: tip }">
        <v-btn
          v-bind="tip"
          icon
          size="x-small"
          variant="text"
          @click="emit('edit')"
        >
          <v-icon size="16">mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
  </div>
</template>

<style scoped>
.message-actions {
  display: flex;
  gap: 0;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.message-actions :deep(.v-btn) {
  background: transparent !important;
  box-shadow: none !important;
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 6px !important;
}
.message-actions :deep(.v-btn:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}
</style>
