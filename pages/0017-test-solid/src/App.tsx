import CounterCard from './CounterCard';

export default function App() {
  return (
    <div class="p-4">
      <h1 class="font-bold mb-4">SolidJS + TSX props test</h1>
      <CounterCard
        title="Counter card"
        initialCount={3}
        step={2}
        actionLabel="Increment by 2"
      />
    </div>
  );
}
