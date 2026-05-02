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
const spread = 120; // стандартное отклонение для Гаусса

// Обновляем центр при изменении размера окна
window.addEventListener('resize', () => {
  centerX = window.innerWidth / 2;
  centerY = window.innerHeight / 2;
});

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

// Интерфейс для активных элементов
interface ActiveRect {
  element: HTMLDivElement;
  age: number;
  maxAge: number;
}

const activeRects: ActiveRect[] = [];

// Создать новый message box с ошибкой
function addRectangle(): void {
  const pos = getGaussianPosition();
  const width = 220 + Math.random() * 80;
  const height = 120 + Math.random() * 40;

  // Контейнер message box
  const box = document.createElement('div');
  box.style.position = 'absolute';
  box.style.left = `${pos.x - width / 2}px`;
  box.style.top = `${pos.y - height / 2}px`;
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

  // Шапка с иконкой ошибки и заголовком
  const header = document.createElement('div');
  header.style.background = 'linear-gradient(180deg, #ff6b6b 0%, #ee5a5a 100%)';
  header.style.padding = '10px 12px';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.gap = '8px';
  header.style.borderBottom = '1px solid #cc4444';

  // Иконка ошибки (красный круг с X)
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

  // Кнопка OK (декоративная)
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
    age: 0,
    maxAge: 300,
  });
}

// Обновить все прямоугольники
function updateRects(): void {
  for (let i = activeRects.length - 1; i >= 0; i--) {
    const rect = activeRects[i];
    rect.age++;

    const progress = rect.age / rect.maxAge;

    if (progress >= 1) {
      rect.element.remove();
      activeRects.splice(i, 1);
      continue;
    }

    const blur = progress * 15;
    const opacity = 1 - progress;

    rect.element.style.filter = `blur(${blur}px)`;
    rect.element.style.opacity = `${opacity}`;

    const shrinkFactor = 1 - progress * 0.08;
    rect.element.style.transform = `scale(${shrinkFactor})`;
  }
}

// Анимационный цикл
function animate(): void {
  updateRects();
  requestAnimationFrame(animate);
}

// Добавлять message box каждые ~100мс
setInterval(addRectangle, 100);

// Запускаем
addRectangle();
animate();
