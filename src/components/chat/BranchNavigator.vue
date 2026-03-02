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
  gap: 2px;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.branch-nav:hover {
  opacity: 1;
}
.branch-counter {
  font-size: 0.7rem;
  color: #aaa;
  min-width: 24px;
  text-align: center;
}
</style>
