import { createSignal } from 'solid-js';
import { CardForm } from './CardForm/CardForm.tsx';
import { CardFormModeSwitch } from './CardFormModeSwitch/CardFormModeSwitch.tsx';
import type { LayoutMode } from './CardForm/layoutMode.ts';

export default function App() {
  const [layoutMode, setLayoutMode] = createSignal<LayoutMode>('normal');

  return (
    <div class="mt-[50px] flex flex-col items-center gap-5">
      <CardFormModeSwitch value={layoutMode()} onChange={setLayoutMode} />
      <CardForm layoutMode={layoutMode()} />
    </div>
  );
}
