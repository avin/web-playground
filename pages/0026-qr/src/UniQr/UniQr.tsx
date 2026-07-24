import { useId, useMemo } from 'react';
import { QRCode, QRSvg } from 'sexy-qr';
import logoSrc from './images/logo.svg?raw';
import logoMonoSrc from './images/logo-mono.svg?raw';
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
  /** true (по умолчанию) — скруглять outward-углы corner-блоков и рамки.
   *  false — углы прямые (resolveCornerRadius возвращает 0). */
  rounded?: boolean;
  /** Фиксированный цвет заливки QR и логотипа. Если задан — градиент отключается,
   *  используется монохромный логотип, перекрашенный в этот цвет. */
  color?: string;
  /** className для корневого контейнера. */
  className?: string;
}

// Вертикальный градиент заливки QR (по умолчанию): сверху #0BD3D6, снизу #209FFF.
// Path-ы sexy-qr наследуют fill корневого <svg>, поэтому достаточно объявить
// градиент в <defs> и подсунуть url(#...) в опцию fill.
// <image> логотипа fill не наследует — остаётся с исходными цветами (для градиента)
// или перекрашивается в `color` (для монохромного логотипа).
//
// ВАЖНО: gradientUnits="userSpaceOnUse" + реальная высота QR в px, а НЕ дефолтный
// objectBoundingBox. Иначе координаты 0..1 считаются от bbox каждого path — и каждый
// модуль получит свой персональный мини-градиент вместо одного общего.
const GRADIENT_TOP = '#0BD3D6';
const GRADIENT_BOTTOM = '#209FFF';

// Радиус outward-дуги corner-блоков QR (в "модулях"). Используется и в
// resolveCornerRadius, и для расчёта концентрической рамки — единый источник правды.
const OUTWARD_OUTER_RADIUS = 4.3;
const INWARD_OUTER_RADIUS = 2.8;

// Рамка вокруг QR (рендерится HTML- div, не трогая SVG).
const FRAME_COLOR = '#1e0843';
const FRAME_WIDTH = 5; // px
const LOGO_MARGIN_CELLS = 1.25; // отступ логотипа (и рамки) от QR-контента, в клетках

export default function UniQr({
  payload,
  baseSize,
  perfectSize = true,
  withFrame = false,
  rounded = true,
  color,
  className,
}: UniQrProps) {
  // Уникальный id градиента — на странице может быть несколько QR, id не должен
  // конфликтовать между ними.
  const gradientId = useId().replace(/[:]/g, '');

  const { svgCode, frameStyle } = useMemo(() => {
    // Высший уровень коррекции ошибок: в центре QR вырезается большой квадрат под
    // логотип (~14% модулей), нужна подстраховка уровня H (~30%).
    const qrCode = new QRCode({
      content: payload,
      ecl: 'H',
    });

    // Вырезаем нечётный по размеру квадрат в центре под логотип: нечётный размер
    // = идеальное центрирование по границам модулей.
    const emptyCenterSize = 2 * Math.round((qrCode.size * 0.4) / 2) - 1;
    qrCode.emptyCenter(emptyCenterSize);

    // Заливка QR: фиксированный цвет, если задан `color`, иначе общий градиент.
    const fill = color ?? `url(#${gradientId})`;

    const qrSvg = new QRSvg(qrCode, {
      fill,
      // Градиент нужен только когда fill ссылается на него (color не задан).
      preContent: color
        ? undefined
        : (q) => {
            // Высота QR в px = число модулей × размер модуля. Один общий градиент
            // по всей высоте в координатах всего <svg> (userSpaceOnUse).
            const h = q.matrixSize * q.pointSize;
            return `<defs><linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${h}"><stop offset="0" stop-color="${GRADIENT_TOP}"/><stop offset="1" stop-color="${GRADIENT_BOTTOM}"/></linearGradient></defs>`;
          },
      size: perfectSize
        ? nearestSizeToPerfectFitCells(baseSize, qrCode.size)
        : baseSize,
      outerCornerRadius: 0,
      innerCornerRadius: 0,
      resolveCornerRadius: (corner) => {
        // rounded=false — все углы прямые, не трогаем геометрию path-ов.
        if (!rounded) {
          return 0;
        }

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
        // Цветной логотип (изображение) — при фикс-цвете перекрашиваем монохромный.
        // fill на корне logo-mono.svg наследуется всеми внутренними path-ами,
        // а CSS .st0{fill:#fff} (фон) имеет приоритет над атрибутом — остаётся белым.
        const logoStr =
          color != null
            ? logoMonoSrc.replace('fill="#000000"', `fill="${color}"`)
            : logoSrc;
        const logoDataUri =
          'data:image/svg+xml;base64,' +
          window.btoa(unescape(encodeURIComponent(logoStr)));
        return `<image x="${start}" y="${start}" width="${size}" height="${size}" href="${logoDataUri}" />`;
      },
    });

    // Геометрия рамки для HTML-обёртки: padding = отступ логотипа (рамка на том же
    // расстоянии от QR-контента), радиус — концентрический к outward-дуге QR.
    // При rounded=false — рамка с прямыми углами.
    const frameMargin = LOGO_MARGIN_CELLS * qrSvg.pointSize;
    const qrArcRadius = (OUTWARD_OUTER_RADIUS * qrSvg.pointSize) / 2;
    const frameArcRadius = rounded ? qrArcRadius + frameMargin : 0;
    const frameStyle = {
      padding: `${frameMargin}px`,
      borderWidth: `${FRAME_WIDTH}px`,
      borderStyle: 'solid',
      borderColor: FRAME_COLOR,
      borderRadius: `${frameArcRadius}px`,
      boxSizing: 'content-box',
    } as const;

    return { svgCode: qrSvg.svg, frameStyle };
  }, [payload, baseSize, perfectSize, rounded, color, gradientId]);

  const inner = (
    <div
      className={className}
      role="presentation"
      dangerouslySetInnerHTML={{ __html: svgCode }}
    />
  );

  if (!withFrame) {
    return inner;
  }

  return <div style={frameStyle}>{inner}</div>;
}
