import { useMemo } from 'react';
import { QRCode, QRSvg } from 'sexy-qr';
import logoSrc from './images/logo.svg?raw';
import { nearestSizeToPerfectFitCells } from '../helpers.ts';

export interface UniQrProps {
  /** Закодированная строка (URL, текст). */
  payload: string;
  /** Базовый размер QR в px (до уточнения до perfect-fit). */
  baseSize: number;
  /** true — уточнить размер так, чтобы каждая ячейка матрицы = целое число пикселей
   *  (модули рисуются чётко, без размытия). false — строго baseSize. */
  perfectSize?: boolean;
  /** true — рисовать концентрическую рамку вокруг QR. */
  withFrame?: boolean;
  /** className для корневого контейнера. */
  className?: string;
}

// Вертикальный градиент заливки QR: сверху #0BD3D6, снизу #209FFF.
// Path-ы sexy-qr наследуют fill корневого <svg>, поэтому достаточно объявить
// градиент в <defs> и подсунуть url(#...) в опцию fill.
// <image> логотипа fill не наследует — остаётся с исходными цветами.
//
// ВАЖНО: gradientUnits="userSpaceOnUse" + реальная высота QR в px, а НЕ дефолтный
// objectBoundingBox. Иначе координаты 0..1 считаются от bbox каждого path — и каждый
// модуль получит свой персональный мини-градиент вместо одного общего.
const GRADIENT_ID = 'qrGradient';
const GRADIENT_TOP = '#0BD3D6';
const GRADIENT_BOTTOM = '#209FFF';

// Радиус outward-дуги corner-блоков QR (в "модулях"). Используется и в
// resolveCornerRadius, и для расчёта концентрической рамки — единый источник правды.
const OUTWARD_OUTER_RADIUS = 4.3;
const INWARD_OUTER_RADIUS = 2.8;

// Рамка вокруг QR.
const FRAME_COLOR = '#1e0843';
const FRAME_WIDTH = 4; // px
const LOGO_MARGIN_CELLS = 1.25; // отступ логотипа (и рамки) от QR-контента, в клетках

export default function UniQr({
  payload,
  baseSize,
  perfectSize = true,
  withFrame = false,
  className,
}: UniQrProps) {
  const svgCode = useMemo(() => {
    // Высший уровень коррекции ошибок: в центре QR вырезается большой квадрат под
    // логотип (~14% модулей), нужна подстраховка уровня H (~30%).
    const qrCode = new QRCode({
      content: payload,
      ecl: 'M',
    });

    // Вырезаем нечётный по размеру квадрат в центре под логотип: нечётный размер
    // = идеальное центрирование по границам модулей.
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
      size: perfectSize
        ? nearestSizeToPerfectFitCells(baseSize, qrCode.size)
        : baseSize,
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
          return corner.contour === 'outer'
            ? OUTWARD_OUTER_RADIUS
            : INWARD_OUTER_RADIUS;
        }

        return corner.defaultRadius;
      },
      postContent: () => {
        // Край вырезанной под логотип зоны (он же — граница ближайших QR-модулей).
        const emptyStart =
          (qrSvg.matrixSize / 2 - emptyCenterSize / 2) * qrSvg.pointSize;
        const emptyEdge = emptyCenterSize * qrSvg.pointSize;
        // Отступ логотипа от QR-контента — LOGO_MARGIN_CELLS клеток с каждой стороны.
        const margin = LOGO_MARGIN_CELLS * qrSvg.pointSize;
        const start = emptyStart + margin;
        const size = emptyEdge - 2 * margin;
        const logoDataUri =
          'data:image/svg+xml;base64,' +
          window.btoa(unescape(encodeURIComponent(logoSrc)));
        return `<image x="${start}" y="${start}" width="${size}" height="${size}" href="${logoDataUri}" />`;
      },
    });

    // Без рамки — отдаём QR как есть.
    if (!withFrame) {
      return qrSvg.svg;
    }

    // Концентрическая рамка вокруг QR на том же расстоянии, что и отступ логотипа.
    // sexy-qr жёстко выдаёт viewBox="0 0 size size", а рамка должна быть снаружи —
    // поэтому оборачиваем QR внешним <svg> с расширенным viewBox.
    const qrSize = qrSvg.matrixSize * qrSvg.pointSize; // сторона QR в px
    const frameMargin = LOGO_MARGIN_CELLS * qrSvg.pointSize; // зазор QR↔рамка
    // Радиус outward-дуги QR в px (как в исходнике sexy-qr: c * pointSize / 2).
    const qrArcRadius = (OUTWARD_OUTER_RADIUS * qrSvg.pointSize) / 2;
    // Концентрический радиус дуги рамки (по средней линии обводки): тот же центр,
    // что у дуги QR, плюс зазор рамки и половина толщины обводки → постоянный зазор.
    const frameArcRadius = qrArcRadius + frameMargin + FRAME_WIDTH / 2;
    const outerSize = qrSize + 2 * (frameMargin + FRAME_WIDTH);

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-frameMargin - FRAME_WIDTH} ${-frameMargin - FRAME_WIDTH} ${outerSize} ${outerSize}" width="${outerSize}" height="${outerSize}">` +
      `<rect x="${-frameMargin - FRAME_WIDTH / 2}" y="${-frameMargin - FRAME_WIDTH / 2}" width="${qrSize + 2 * frameMargin + FRAME_WIDTH}" height="${qrSize + 2 * frameMargin + FRAME_WIDTH}" rx="${frameArcRadius}" fill="none" stroke="${FRAME_COLOR}" stroke-width="${FRAME_WIDTH}" />` +
      qrSvg.svg +
      `</svg>`
    );
  }, [payload, baseSize, perfectSize, withFrame]);

  return (
    <div
      className={className}
      role="presentation"
      dangerouslySetInnerHTML={{ __html: svgCode }}
    />
  );
}
