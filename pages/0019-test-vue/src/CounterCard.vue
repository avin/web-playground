<script setup lang="ts">
import { ref } from 'vue';

type Props = {
  title: string;
  initialCount: number;
  step?: number;
  actionLabel: string;
};

const props = withDefaults(defineProps<Props>(), {
  step: 1,
});

const count = ref(props.initialCount);

const increment = () => {
  count.value += props.step;
};
</script>

<template>
  <section class="border border-gray-300 bg-white p-4 rounded">
    <div class="mb-3">
      <h2 class="text-lg font-semibold">{{ props.title }}</h2>
    </div>
    <div class="flex items-center gap-3">
      <span>Count: {{ count }}</span>
      <button
        class="border border-gray-400 px-3 py-2 bg-gray-100"
        type="button"
        @click="increment"
      >
        {{ props.actionLabel }}
      </button>
    </div>
  </section>
</template>
