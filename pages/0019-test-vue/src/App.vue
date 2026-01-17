<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);

const increment = () => {
  count.value += 1;
};
</script>

<template>
  <div class="p-4">
    <h1 class="font-bold mb-4">Vue + TS test</h1>
    <p class="mb-4">Count: {{ count }}</p>
    <button
      class="border border-gray-400 p-2 bg-gray-100"
      type="button"
      @click="increment"
    >
      Increment
    </button>
  </div>
</template>
