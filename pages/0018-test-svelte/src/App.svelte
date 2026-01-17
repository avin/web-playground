<script lang="ts">
  import CounterCard from './CounterCard.svelte';
</script>

<div class="p-4">
  <h1 class="font-bold mb-4">Svelte 5 + TS props test</h1>
  <CounterCard
    title="Counter card"
    initialCount={3}
    step={2}
    actionLabel="Increment by 2"
  />
</div>
