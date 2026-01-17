<script lang="ts">
  type Props = {
    title: string;
    initialCount: number;
    step?: number;
    actionLabel: string;
  };

  let { title, initialCount, step = 1, actionLabel } = $props<Props>();

  // svelte-ignore state_referenced_locally
  let count = $state(initialCount);

  const increment = () => {
    count += step;
  };
</script>

<section class="border border-gray-300 bg-white p-4 rounded">
  <div class="mb-3">
    <h2 class="text-lg font-semibold">{title}</h2>
  </div>
  <div class="flex items-center gap-3">
    <span>Count: {count}</span>
    <button
      class="border border-gray-400 px-3 py-2 bg-gray-100"
      type="button"
      onclick={increment}
    >
      {actionLabel}
    </button>
  </div>
</section>
