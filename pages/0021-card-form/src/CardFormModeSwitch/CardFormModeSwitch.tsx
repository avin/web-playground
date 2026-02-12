import styles from './CardFormModeSwitch.module.scss';
import type { LayoutMode } from '../CardForm/layoutMode.ts';

type CardFormModeSwitchProps = {
  value: LayoutMode;
  onChange: (mode: LayoutMode) => void;
};

export function CardFormModeSwitch(props: CardFormModeSwitchProps) {
  const isActive = (mode: LayoutMode) => props.value === mode;

  return (
    <div
      class={styles.container}
      role="group"
      aria-label="Режим отображения формы"
    >
      <button
        type="button"
        class={styles.button}
        classList={{ [styles.buttonActive]: isActive('normal') }}
        onClick={() => props.onChange('normal')}
      >
        Нормально
      </button>
      <button
        type="button"
        class={styles.button}
        classList={{ [styles.buttonActive]: isActive('uzko') }}
        onClick={() => props.onChange('uzko')}
      >
        Узко
      </button>
      <button
        type="button"
        class={styles.button}
        classList={{ [styles.buttonActive]: isActive('nizko') }}
        onClick={() => props.onChange('nizko')}
      >
        Низко
      </button>
    </div>
  );
}
