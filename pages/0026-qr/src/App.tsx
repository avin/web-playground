import UniQr from './UniQr/UniQr.tsx';
import styles from './App.module.scss';

export default function App() {
  return (
    <div className={styles.page}>
      <div className={styles.qrContainer}>
        <UniQr
          payload="https://sbp.nspk.ru/"
          baseSize={400}
          perfectSize
          withFrame
        />
      </div>
    </div>
  );
}
