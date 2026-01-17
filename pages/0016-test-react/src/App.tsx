import CounterCard from './CounterCard';

export default function App() {
  return (
    <div className="p-4">
      <h1 className="font-bold mb-4">React + TSX props test</h1>
      <CounterCard
        title="Counter card"
        initialCount={3}
        step={2}
        actionLabel="Increment by 2"
      />
    </div>
  );
}
