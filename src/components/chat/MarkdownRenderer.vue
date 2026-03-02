<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { renderMarkdown, setupCopyHandler } from '../../composables/useMarkdown';

const props = defineProps<{
  content: string;
}>();

onMounted(() => {
  setupCopyHandler();
});

const html = computed(() => renderMarkdown(props.content));
</script>

<template>
  <div class="message-content" v-html="html"></div>
</template>
