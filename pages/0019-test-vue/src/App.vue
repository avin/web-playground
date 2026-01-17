<script setup lang="ts">
import CounterCard from './CounterCard.vue';
</script>

<template>
  <div class="p-4">
    <h1 class="font-bold mb-4">Vue + TS props test</h1>
    <CounterCard
      title="Counter card"
      :initial-count="3"
      :step="2"
      action-label="Increment by 2"
    />
  </div>
</template>
