import UniQr from './UniQr/UniQr.tsx';
import styles from './App.module.scss';

const PAYLOAD = 'https://sbp.nspk.ru/';
const BASE_SIZE = 400;

type Variant = {
  label: string;
  perfectSize: boolean;
  withFrame: boolean;
  rounded: boolean;
  color?: string;
};

const variants: Variant[] = [
  {
    label: 'Градиент · рамка',
    perfectSize: true,
    withFrame: true,
    rounded: true,
  },
  {
    label: 'Градиент · без рамки',
    perfectSize: true,
    withFrame: false,
    rounded: true,
  },
  {
    label: 'Фикс. цвет #1e0843 · рамка',
    perfectSize: true,
    withFrame: true,
    rounded: true,
    color: '#1e0843',
  },
  {
    label: 'Фикс. цвет #e63946 · без рамки',
    perfectSize: true,
    withFrame: false,
    rounded: true,
    color: '#e63946',
  },
];

export default function App() {
  return (
    <div className={styles.page}>
      <div className={styles.list}>
        {variants.map((v) => (
          <div className={styles.item} key={v.label}>
            <UniQr
              payload={PAYLOAD}
              baseSize={BASE_SIZE}
              perfectSize={v.perfectSize}
              withFrame={v.withFrame}
              rounded={v.rounded}
              color={v.color}
            />
            <div className={styles.label}>{v.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
