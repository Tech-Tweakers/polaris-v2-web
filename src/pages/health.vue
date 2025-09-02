<template>
  <div>
    {{ healthData }}
  </div>
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
