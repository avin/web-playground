import { useState } from 'react';

type Props = {
  title: string;
  initialCount: number;
  step?: number;
  actionLabel: string;
};

export default function CounterCard({
  title,
  initialCount,
  step = 1,
  actionLabel,
}: Props) {
  const [count, setCount] = useState(initialCount);

  const handleIncrement = () => {
    setCount((value) => value + step);
  };

  return (
    <section className="border border-gray-300 bg-white p-4 rounded">
      <div className="mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <span>Count: {count}</span>
        <button
          className="border border-gray-400 px-3 py-2 bg-gray-100"
          type="button"
          onClick={handleIncrement}
        >
          {actionLabel}
        </button>
      </div>
    </section>
  );
}
