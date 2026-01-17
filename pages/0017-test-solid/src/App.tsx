import { createSignal } from 'solid-js';

export default function App() {
  const [count, setCount] = createSignal(0);

  return (
    <div class="p-4">
      <h1 class="font-bold mb-4">SolidJS + TSX test</h1>
      <p class="mb-4">Count: {count()}</p>
      <button
        class="border border-gray-400 p-2 bg-gray-100"
        type="button"
        onClick={() => setCount(count() + 1)}
      >
        Increment
      </button>
    </div>
  );
}
