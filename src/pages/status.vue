<template>
  <div>{{ status }}</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { healthService } from '../services/healthService';

const status = ref<string>('checking...');

onMounted(async () => {
  try {
    const health = await healthService.getHealthStatus();
    status.value = health.status;
  } catch (error) {
    status.value = 'error';
  }
});
</script>
