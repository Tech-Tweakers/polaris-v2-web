<template>
  <pre>{{ JSON.stringify(healthData, null, 2) }}</pre>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { healthService } from '../services/healthService';

const healthData = ref<any>(null);

onMounted(async () => {
  try {
    healthData.value = await healthService.getHealthStatus();
  } catch (error) {
    healthData.value = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Failed to get health status'
    };
  }
});
</script>

<style scoped>
pre {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 20px;
  overflow-x: auto;
}
</style>
