// Создаём контейнер для анимации
const container = document.createElement('div');
container.style.position = 'relative';
container.style.width = '800px';
container.style.height = '800px';
container.style.border = '1px solid #000';
container.style.overflow = 'hidden';
document.body.appendChild(container);

const centerX = 400;
const centerY = 400;
const spread = 60; // стандартное отклонение для Гаусса

// Генератор случайных чисел по Гауссовскому распределению (Box-Muller)
function gaussianRandom(): number {
  let u = 0,
    v = 0;
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

// Случайный цвет
function getRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 80%, 50%)`;
}

// Интерфейс для активных элементов
interface ActiveRect {
  element: HTMLDivElement;
  age: number; // возраст в кадрах
  maxAge: number; // максимальный возраст перед исчезновением
}

const activeRects: ActiveRect[] = [];

// Создать новый прямоугольник
function addRectangle(): void {
  const pos = getGaussianPosition();
  const width = (40 + Math.random() * 50) * 3; // ширина
  const height = (20 + Math.random() * 25) * 3; // высота

  const rect = document.createElement('div');
  rect.style.position = 'absolute';
  rect.style.left = `${pos.x - width / 2}px`;
  rect.style.top = `${pos.y - height / 2}px`;
  rect.style.width = `${width}px`;
  rect.style.height = `${height}px`;
  rect.style.backgroundColor = getRandomColor();
  rect.style.borderRadius = '4px';
  rect.style.pointerEvents = 'none'; // чтобы не мешали кликам
  rect.style.border = '1px solid #000';

  container.appendChild(rect);

  activeRects.push({
    element: rect,
    age: 0,
    maxAge: 180, // время жизни в кадрах
  });
}

// Обновить все прямоугольники
function updateRects(): void {
  for (let i = activeRects.length - 1; i >= 0; i--) {
    const rect = activeRects[i];
    rect.age++;

    const progress = rect.age / rect.maxAge; // 0 -> 1

    if (progress >= 1) {
      // Удаляем элемент
      rect.element.remove();
      activeRects.splice(i, 1);
      continue;
    }

    // Вычисляем blur и opacity
    const blur = progress * 20; // blur от 0 до 20px
    const opacity = 1 - progress; // opacity от 1 до 0

    rect.element.style.filter = `blur(${blur}px)`;
    rect.element.style.opacity = `${opacity}`;

    // Сжатие к центру
    const shrinkFactor = 1 - progress * 0.1; // уменьшаем до 90% от оригинала
    rect.element.style.transform = `scale(${shrinkFactor})`;
  }
}

// Анимационный цикл
function animate(): void {
  updateRects();
  requestAnimationFrame(animate);
}

// Добавлять прямоугольник каждые ~100мс
setInterval(addRectangle, 50);

// Запускаем
addRectangle();
animate();
