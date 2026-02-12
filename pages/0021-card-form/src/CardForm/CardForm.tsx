import styles from './CardForm.module.scss';
import logosImgSrc from './images/logos.svg';
import type { LayoutMode } from './layoutMode.ts';

type CardFormProps = {
  layoutMode: LayoutMode;
};

export function CardForm(props: CardFormProps) {
  return (
    <div
      class={styles.container}
      classList={{
        [styles.uzko]: props.layoutMode === 'uzko',
        [styles.nizko]: props.layoutMode === 'nizko',
      }}
    >
      <div class={styles.logos}>
        <img src={logosImgSrc} alt="" />
      </div>

      <div class={styles.number}>
        <div class={styles.field}>
          <label>Номер карты</label>
          <input type="text" placeholder="0000 0000 0000 0000" />
        </div>
      </div>

      <div class={styles.date}>
        <div class={styles.field}>
          <label>ММ/ГГ</label>
          <input type="text" placeholder="00/00" />
        </div>
      </div>

      <div class={styles.stripe} />
      <div class={styles.cvc}>
        <div class={styles.field}>
          <label>CVC/CVV</label>
          <input type="password" placeholder="***" />
        </div>
      </div>

      <div class={styles.save}>
        <div class={styles.checkbox}>
          <input type="checkbox" id="save" />
          <label for="save">Запомнить карту</label>
        </div>
      </div>
    </div>
  );
}
