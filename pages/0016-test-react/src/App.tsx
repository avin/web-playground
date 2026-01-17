import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4">
      <h1 className="font-bold mb-4">React + TSX test</h1>
      <p className="mb-4">Count: {count}</p>
      <button
        className="border border-gray-400 p-2 bg-gray-100"
        type="button"
        onClick={() => setCount((value) => value + 1)}
      >
        Increment
      </button>
    </div>
  );
}
