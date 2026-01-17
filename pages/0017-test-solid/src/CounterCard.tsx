import { createSignal } from 'solid-js';

type Props = {
  title: string;
  initialCount: number;
  step?: number;
  actionLabel: string;
};

export default function CounterCard(props: Props) {
  const [count, setCount] = createSignal(props.initialCount);
  const step = () => props.step ?? 1;

  const handleIncrement = () => {
    setCount((value) => value + step());
  };

  return (
    <section class="border border-gray-300 bg-white p-4 rounded">
      <div class="mb-3">
        <h2 class="text-lg font-semibold">{props.title}</h2>
      </div>
      <div class="flex items-center gap-3">
        <span>Count: {count()}</span>
        <button
          class="border border-gray-400 px-3 py-2 bg-gray-100"
          type="button"
          onClick={handleIncrement}
        >
          {props.actionLabel}
        </button>
      </div>
    </section>
  );
}
