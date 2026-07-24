import { printHello, startDebugger } from './helpers.ts';

const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
canvas.style.border = '1px solid black';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Could not get 2D context');
}

// draw many circles
for (let i = 0; i < 100; i++) {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const radius = Math.random() * 20 + 5;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
  ctx.fill();
}
