// Устанавливаем фон body
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.backgroundColor = '#1a1a2e';
document.body.style.overflow = 'hidden';

// Создаём контейнер для анимации на весь экран
const container = document.createElement('div');
container.style.position = 'fixed';
container.style.top = '0';
container.style.left = '0';
container.style.width = '100vw';
container.style.height = '100vh';
container.style.overflow = 'hidden';
document.body.appendChild(container);

// Вычисляем центр экрана
let centerX = window.innerWidth / 2;
let centerY = window.innerHeight / 2;

const spread = 120;

// Настройки анимации
const SPAWN_INTERVAL_MS = 75;
const MAX_RECTS = 95;
const MAX_FRAME_DELTA_MS = 50;

let nextZIndex = 1000;

// Обновляем центр при изменении размера окна
window.addEventListener('resize', () => {
  centerX = window.innerWidth / 2;
  centerY = window.innerHeight / 2;
});

// Генератор случайных чисел по Гауссовскому распределению
function gaussianRandom(): number {
  let u = 0;
  let v = 0;

  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();

  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Получить координаты по Гауссу вокруг центра
function getGaussianPosition(): { x: number; y: number } {
  return {
    x: centerX + gaussianRandom() * spread,
    y: centerY + gaussianRandom() * spread,
  };
}

// Случайное сообщение об ошибке
function getRandomErrorMessage(): string {
  const messages = [
    'System failure detected',
    'Connection lost',
    'Memory access violation',
    'Unknown error occurred',
    'Critical system error',
    'Driver not responding',
    'Stack overflow',
    'Null pointer exception',
    'Segmentation fault',
    'Permission denied',
    'File not found',
    'Network timeout',
    'Disk full',
    'Invalid operation',
    'Runtime error #42',
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInCubic(t: number): number {
  return t * t * t;
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Интерфейс для активных элементов
interface ActiveRect {
  element: HTMLDivElement;
  ageMs: number;
  maxAgeMs: number;
  startX: number;
  startY: number;
  width: number;
  height: number;

  rotation: number;
  impactX: number;
  impactY: number;
}

const activeRects: ActiveRect[] = [];

let lastFrameTime = performance.now();
let spawnAccumulator = 0;

// Создать новый message box с ошибкой
function addRectangle(): void {
  if (activeRects.length >= MAX_RECTS) {
    const oldest = activeRects.shift();
    oldest?.element.remove();
  }

  const pos = getGaussianPosition();

  const width = 220 + Math.random() * 80;
  const height = 120 + Math.random() * 40;

  const startX = pos.x - width / 2;
  const startY = pos.y - height / 2;

  const box = document.createElement('div');
  box.style.position = 'absolute';
  box.style.left = `${startX}px`;
  box.style.top = `${startY}px`;
  box.style.width = `${width}px`;
  box.style.height = `${height}px`;
  box.style.backgroundColor = '#f0f0f0';
  box.style.borderRadius = '8px';
  box.style.boxShadow =
    '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)';
  box.style.pointerEvents = 'none';
  box.style.display = 'flex';
  box.style.flexDirection = 'column';
  box.style.overflow = 'hidden';
  box.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';

  box.style.willChange = 'transform, opacity, filter';
  box.style.transformOrigin = 'center center';
  box.style.backfaceVisibility = 'hidden';
  box.style.contain = 'layout paint style';
  box.style.opacity = '0';
  box.style.transform = 'translate3d(0, 0, 0) scale(0.68)';

  // Важно: каждое новое окно получает z-index больше предыдущего
  box.style.zIndex = `${nextZIndex++}`;

  // Шапка с иконкой ошибки и заголовком
  const header = document.createElement('div');
  header.style.background = 'linear-gradient(180deg, #ff6b6b 0%, #ee5a5a 100%)';
  header.style.padding = '10px 12px';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.gap = '8px';
  header.style.borderBottom = '1px solid #cc4444';

  // Иконка ошибки
  const icon = document.createElement('div');
  icon.style.width = '18px';
  icon.style.height = '18px';
  icon.style.backgroundColor = '#fff';
  icon.style.borderRadius = '50%';
  icon.style.display = 'flex';
  icon.style.alignItems = 'center';
  icon.style.justifyContent = 'center';
  icon.style.fontSize = '12px';
  icon.style.color = '#ee5a5a';
  icon.style.fontWeight = 'bold';
  icon.textContent = '✕';

  // Заголовок
  const title = document.createElement('span');
  title.style.color = '#fff';
  title.style.fontSize = '14px';
  title.style.fontWeight = '600';
  title.textContent = 'Error';

  header.appendChild(icon);
  header.appendChild(title);

  // Тело сообщения
  const body = document.createElement('div');
  body.style.flex = '1';
  body.style.padding = '16px';
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.justifyContent = 'space-between';

  // Текст ошибки
  const messageText = document.createElement('p');
  messageText.style.margin = '0';
  messageText.style.color = '#333';
  messageText.style.fontSize = '13px';
  messageText.style.lineHeight = '1.4';
  messageText.textContent = getRandomErrorMessage();

  // Кнопка OK
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.marginTop = '12px';

  const okButton = document.createElement('button');
  okButton.style.padding = '6px 20px';
  okButton.style.background =
    'linear-gradient(180deg, #e8e8e8 0%, #d0d0d0 100%)';
  okButton.style.border = '1px solid #999';
  okButton.style.borderRadius = '4px';
  okButton.style.fontSize = '12px';
  okButton.style.color = '#333';
  okButton.style.cursor = 'default';
  okButton.textContent = 'OK';

  buttonContainer.appendChild(okButton);

  body.appendChild(messageText);
  body.appendChild(buttonContainer);

  box.appendChild(header);
  box.appendChild(body);

  container.appendChild(box);

  activeRects.push({
    element: box,
    ageMs: 0,
    maxAgeMs: 3200 + Math.random() * 1100,
    startX,
    startY,
    width,
    height,

    rotation: (Math.random() - 0.5) * 10,
    impactX: (Math.random() - 0.5) * 34,
    impactY: (Math.random() - 0.5) * 24,
  });
}

// Обновить все прямоугольники
function updateRects(deltaMs: number): void {
  for (let i = activeRects.length - 1; i >= 0; i--) {
    const rect = activeRects[i];

    rect.ageMs += deltaMs;

    const progress = clamp01(rect.ageMs / rect.maxAgeMs);

    if (progress >= 1) {
      rect.element.remove();
      activeRects.splice(i, 1);
      continue;
    }

    // Быстрое появление с overshoot
    const appearProgress = smoothstep(0.0, 0.11, progress);
    const appearOpacity = smoothstep(0.0, 0.055, progress);

    const popScale = lerp(0.68, 1.0, easeOutBack(appearProgress));

    // Короткий "ударный" дрейф при появлении
    const impactProgress = 1 - easeOutQuart(appearProgress);
    const impactOffsetX = rect.impactX * impactProgress;
    const impactOffsetY = rect.impactY * impactProgress;

    // Движение к центру:
    // чуть заметнее, чтобы окно не выглядело статичным
    const moveProgress = easeInCubic(progress);

    const centerOffsetX =
      (centerX - rect.width / 2 - rect.startX) * moveProgress * 0.11;

    const centerOffsetY =
      (centerY - rect.height / 2 - rect.startY) * moveProgress * 0.11;

    // Blur начинается раньше, но растёт мягко
    const blurProgress = smoothstep(0.34, 0.96, progress);
    const blur = Math.pow(blurProgress, 1.75) * 18;

    // Fade начинается раньше, чтобы демка не зависала визуально
    const fadeProgress = smoothstep(0.58, 0.96, progress);
    const fadeOpacity = 1 - Math.pow(fadeProgress, 1.35);

    const opacity = appearOpacity * fadeOpacity;

    // Перспективное уменьшение
    const shrinkProgress = smoothstep(0.12, 1.0, progress);
    const shrinkFactor = 1 - shrinkProgress * 0.32;

    // Небольшой поворот при появлении, который быстро выравнивается
    const rotationSettle = 1 - smoothstep(0.0, 0.22, progress);
    const rotationDrift = smoothstep(0.55, 1.0, progress) * 0.25;

    const rotation =
      rect.rotation * rotationSettle + rect.rotation * rotationDrift;

    const translateX = centerOffsetX + impactOffsetX;
    const translateY = centerOffsetY + impactOffsetY;

    const scale = popScale * shrinkFactor;

    rect.element.style.filter = `blur(${blur}px)`;
    rect.element.style.opacity = `${opacity}`;
    rect.element.style.transform = `
      translate3d(${translateX}px, ${translateY}px, 0)
      rotate(${rotation}deg)
      scale(${scale})
    `;
  }
}

// Анимационный цикл
function animate(now: number): void {
  if (document.hidden) {
    lastFrameTime = now;
    spawnAccumulator = 0;
    requestAnimationFrame(animate);
    return;
  }

  const deltaMs = Math.min(now - lastFrameTime, MAX_FRAME_DELTA_MS);
  lastFrameTime = now;

  spawnAccumulator += deltaMs;

  while (spawnAccumulator >= SPAWN_INTERVAL_MS) {
    addRectangle();
    spawnAccumulator -= SPAWN_INTERVAL_MS;
  }

  updateRects(deltaMs);

  requestAnimationFrame(animate);
}

// Сброс таймеров при возврате на страницу
document.addEventListener('visibilitychange', () => {
  lastFrameTime = performance.now();
  spawnAccumulator = 0;
});

// Запуск
addRectangle();
requestAnimationFrame(animate);
