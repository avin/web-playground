import { useMemo } from 'react';
import { QRCode, QRSvg } from 'sexy-qr';
// Импорт SVG как строки: btoa нужен только в браузере, поэтому рендерим чисто клиентский SVG.
import logoSrc from './assets/logo.svg?raw';
import { nearestSizeToPerfectFitCells } from './helpers';
import styles from './App.module.scss';

const SBP_PAYLOAD = 'https://sbp.nspk.ru/';
const BASE_SIZE = 400; // базовый размер QR — уточняется до perfect-fit ниже

export default function App() {
  const svgCode = useMemo(() => {
    // Высший уровень коррекции ошибок: в центре QR вырезается большой
    // квадрат под логотип (~14% модулей), нужна подстраховка уровня H (~30%).
    const qrCode = new QRCode({
      content: SBP_PAYLOAD,
      ecl: 'H',
    });

    // Вырезаем нечётный по размеру квадрат в центре, чтобы логотип был чётко
    // выровнен по границам модулей (нечётный размер = идеальное центрирование).
    const emptyCenterSize = 2 * Math.round((qrCode.size * 0.38) / 2) - 1;
    qrCode.emptyCenter(emptyCenterSize);

    const qrSvg = new QRSvg(qrCode, {
      fill: '#171717',
      // "Умный" размер: каждая ячейка матрицы = целое число пикселей.
      size: nearestSizeToPerfectFitCells(BASE_SIZE, qrCode.size),
      outerCornerRadius: 0,
      innerCornerRadius: 0,
      resolveCornerRadius: (corner) => {
        const isCornerBlockRing =
          corner.region === 'cornerBlock' && corner.part === 'ring';

        const isOutwardCorner =
          (corner.block === 'topLeft' && corner.corner === 'topLeft') ||
          (corner.block === 'topRight' && corner.corner === 'topRight') ||
          (corner.block === 'bottomLeft' && corner.corner === 'bottomLeft');

        if (isCornerBlockRing && isOutwardCorner) {
          return corner.contour === 'outer' ? 4.3 : 2.8;
        }

        return corner.defaultRadius;
      },
      postContent: () => {
        const start =
          (qrSvg.matrixSize / 2 - emptyCenterSize / 2) * qrSvg.pointSize +
          qrSvg.pointSize / 2;
        const size = emptyCenterSize * qrSvg.pointSize - qrSvg.pointSize;
        const logoDataUri =
          'data:image/svg+xml;base64,' +
          window.btoa(unescape(encodeURIComponent(logoSrc)));
        return `<image x="${start}" y="${start}" width="${size}" height="${size}" href="${logoDataUri}" />`;
      },
    });

    return qrSvg.svg;
  }, []);

  return (
    <div className={styles.page}>
      <div
        className={styles.qr}
        role="presentation"
        dangerouslySetInnerHTML={{ __html: svgCode }}
      />
    </div>
  );
}
