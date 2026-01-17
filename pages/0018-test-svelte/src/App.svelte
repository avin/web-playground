<script lang="ts">
  let count = $state(0);
</script>

<div class="p-4">
  <h1 class="font-bold mb-4">Svelte 5 + TS test</h1>
  <p class="mb-4">Count: {count}</p>
  <button
    class="border border-gray-400 p-2 bg-gray-100"
    type="button"
    onclick={() => count++}
  >
    Increment
  </button>
</div>
