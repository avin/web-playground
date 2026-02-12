import styles from './CardForm.module.scss';

export function CardForm() {
  return (
    <div class={styles.container}>
      <div class={`${styles.element} ${styles.logos}`}>
        <span>VISA</span> <span>МИР</span>
      </div>

      <div class={styles.number}>
        <div class={styles.field}>
          <label>Номер карты</label>
          <input type="text" placeholder="4111 1111 1111 1111" />
        </div>
      </div>

      <div class={styles.save}>
        <div class={styles.checkbox}>
          <input type="checkbox" id="save" />
          <label for="save">Запомнить карту</label>
        </div>
      </div>

      <div class={styles.date}>
        <div class={styles.field}>
          <label>ММ/ГГ</label>
          <input type="text" placeholder="12/29" />
        </div>
      </div>

      {/* Задняя часть */}
      <div class={styles.stripe} />
      <div class={styles.cvc}>
        <div class={styles.field}>
          <label>CVC/CVV</label>
          <input type="password" placeholder="***" />
        </div>
      </div>
    </div>
  );
}
