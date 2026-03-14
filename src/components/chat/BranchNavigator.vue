<script setup lang="ts">
defineProps<{
  total: number;
  currentIndex: number;
}>();

const emit = defineEmits<{
  prev: [];
  next: [];
}>();
</script>

<template>
  <div v-if="total > 1" class="branch-nav">
    <v-btn
      icon
      size="x-small"
      variant="text"
      :disabled="currentIndex <= 0"
      @click="emit('prev')"
    >
      <v-icon size="14">mdi-chevron-left</v-icon>
    </v-btn>
    <span class="branch-counter">{{ currentIndex + 1 }}/{{ total }}</span>
    <v-btn
      icon
      size="x-small"
      variant="text"
      :disabled="currentIndex >= total - 1"
      @click="emit('next')"
    >
      <v-icon size="14">mdi-chevron-right</v-icon>
    </v-btn>
  </div>
</template>

<style scoped>
.branch-nav {
  display: flex;
  align-items: center;
  gap: 0;
  opacity: 0.5;
  transition: opacity 0.2s;
  margin-bottom: 0.25rem;
}
.branch-nav:hover {
  opacity: 1;
}
.branch-nav :deep(.v-btn) {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  border-radius: 6px !important;
  background: transparent !important;
  box-shadow: none !important;
  color: #999 !important;
}
.branch-nav :deep(.v-btn:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}
.branch-counter {
  font-size: 0.7rem;
  color: #888;
  min-width: 24px;
  text-align: center;
}
</style>
