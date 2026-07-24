import { useMemo } from 'react';
import { QRCode, QRSvg } from 'sexy-qr';
// Импорт SVG как строки: btoa нужен только в браузере, поэтому рендерим чисто клиентский SVG.
import logoSrc from './assets/logo.svg?raw';
import { nearestSizeToPerfectFitCells } from './helpers';
import styles from './App.module.scss';

const SBP_PAYLOAD = 'https://sbp.nspk.ru/';
const BASE_SIZE = 400; // базовый размер QR — уточняется до perfect-fit ниже

// Вертикальный градиент заливки QR: сверху #0BD3D6, снизу #209FFF.
// Path-ы sexy-qr наследуют fill корневого <svg>, поэтому достаточно
// объявить градиент в <defs> и подсунуть url(#...) в опцию fill.
// <image> логотипа fill не наследует — остаётся с исходными цветами.
//
// ВАЖНО: gradientUnits="userSpaceOnUse" + реальная высота QR в px, а НЕ дефолтный
// objectBoundingBox. Иначе координаты 0..1 считаются от bounding box КАЖДОГО path —
// и каждый модуль получит свой персональный мини-градиент вместо одного общего.
const GRADIENT_ID = 'qrGradient';
const GRADIENT_TOP = '#0BD3D6';
const GRADIENT_BOTTOM = '#209FFF';

export default function App() {
  const svgCode = useMemo(() => {
    // Высший уровень коррекции ошибок: в центре QR вырезается большой
    // квадрат под логотип (~14% модулей), нужна подстраховка уровня H (~30%).
    const qrCode = new QRCode({
      content: SBP_PAYLOAD,
      ecl: 'M',
    });

    // Вырезаем нечётный по размеру квадрат в центре, чтобы логотип был чётко
    // выровнен по границам модулей (нечётный размер = идеальное центрирование).
    const emptyCenterSize = 2 * Math.round((qrCode.size * 0.5) / 2) - 1;
    qrCode.emptyCenter(emptyCenterSize);

    const qrSvg = new QRSvg(qrCode, {
      fill: `url(#${GRADIENT_ID})`,
      preContent: (q) => {
        // Высота QR в px = число модулей × размер модуля. Один общий градиент
        // по всей высоте в координатах всего <svg> (userSpaceOnUse).
        const h = q.matrixSize * q.pointSize;
        return `<defs><linearGradient id="${GRADIENT_ID}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${h}"><stop offset="0" stop-color="${GRADIENT_TOP}"/><stop offset="1" stop-color="${GRADIENT_BOTTOM}"/></linearGradient></defs>`;
      },
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
        // Край вырезанной под логотип зоны (он же — граница ближайших QR-модулей).
        const emptyStart =
          (qrSvg.matrixSize / 2 - emptyCenterSize / 2) * qrSvg.pointSize;
        const emptyEdge = emptyCenterSize * qrSvg.pointSize;
        // Отступ логотипа от QR-контента — 1.25 размера одной клетки с каждой стороны.
        const margin = 1.25 * qrSvg.pointSize;
        const start = emptyStart + margin;
        const size = emptyEdge - 2 * margin;
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
