import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import styles from './CardFormModeSwitch.module.scss';
import type { LayoutMode } from '../CardForm/layoutMode.ts';

const NARROW_WIDTH_BREAKPOINT = 424;
const LOW_HEIGHT_BREAKPOINT = 360;

function resolveLayoutMode(
  viewportWidth: number,
  viewportHeight: number,
): LayoutMode {
  if (viewportWidth <= NARROW_WIDTH_BREAKPOINT) {
    return 'uzko';
  }

  if (viewportHeight <= LOW_HEIGHT_BREAKPOINT) {
    return 'nizko';
  }

  return 'normal';
}

type CardFormModeSwitchProps = {
  value: LayoutMode;
  onChange: (mode: LayoutMode) => void;
};

const modeOptions: ReadonlyArray<{ value: LayoutMode; label: string }> = [
  { value: 'normal', label: 'Нормально' },
  { value: 'uzko', label: 'Узко' },
  { value: 'nizko', label: 'Низко' },
];

export function CardFormModeSwitch(props: CardFormModeSwitchProps) {
  const [isAutoModeEnabled, setIsAutoModeEnabled] = createSignal(true);
  const isActive = (mode: LayoutMode) => props.value === mode;

  const applyAutoLayoutMode = () => {
    const nextMode = resolveLayoutMode(window.innerWidth, window.innerHeight);
    props.onChange(nextMode);
  };

  const handleResize = () => {
    if (!isAutoModeEnabled()) {
      return;
    }
    applyAutoLayoutMode();
  };

  onMount(() => {
    window.addEventListener('resize', handleResize);
  });

  onCleanup(() => {
    window.removeEventListener('resize', handleResize);
  });

  createEffect(() => {
    if (isAutoModeEnabled()) {
      applyAutoLayoutMode();
    }
  });

  return (
    <div
      class={styles.container}
      role="group"
      aria-label="Режим отображения формы"
    >
      {modeOptions.map(({ value, label }) => (
        <button
          type="button"
          class={styles.button}
          classList={{ [styles.buttonActive]: isActive(value) }}
          onClick={() => props.onChange(value)}
        >
          {label}
        </button>
      ))}
      <label class={styles.autoToggle}>
        <input
          type="checkbox"
          checked={isAutoModeEnabled()}
          onInput={(event) => setIsAutoModeEnabled(event.currentTarget.checked)}
        />
        Авто
      </label>
    </div>
  );
}
