// @process

import fragmentShaderSrc from './shaders/fragment.glsl';
import vertexShaderSrc from './shaders/vertext.glsl';

const VERT_ACCURACY = 0.03; // Расстояние между линиями
const CONGESTION = 700; // Кучность волн
const LINES_COUNT = 20; // Число линий
const SHADOW_SIZE = 0.012; // Толщина тени
const LINE_SIZE = 0.01; // Толщина линии
const BACK_COLOR = [23 / 255, 32 / 255, 38 / 255]; // Цвет фона
const COMMON_OFFSET = 0; // Смещение относительно центра
const FRAGMENTS = 200; // Число фрагментов (плавность линий)

const canvas = document.querySelector('#canvas');
const gl =
  canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
const devicePixelRatio = window.devicePixelRatio || 1;

const ext = gl.getExtension('ANGLE_instanced_arrays');
if (!ext) {
  throw new Error('no instances');
}

const resizeCanvasToDisplaySize = (canvas) => {
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth * devicePixelRatio;
    canvas.height = displayHeight * devicePixelRatio;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }
};

const buildPlane = (
  width = 1,
  height = 1,
  widthSegments = 1,
  heightSegments = 1,
) => {
  const wSegs = widthSegments;
  const hSegs = heightSegments;

  const num = (wSegs + 1) * (hSegs + 1);
  const numIndices = wSegs * hSegs * 6;

  const position = new Float32Array(num * 3);
  const normal = new Float32Array(num * 3);
  const uv = new Float32Array(num * 2);
  const index =
    numIndices > 65536
      ? new Uint32Array(numIndices)
      : new Uint16Array(numIndices);

  let u = 0;
  let v = 1;
  let w = 2;
  let uDir = 1;
  let vDir = -1;
  let i = 0;
  let ii = 0;
  let depth = 0;

  const io = i;
  const segW = width / wSegs;
  const segH = height / hSegs;

  for (let iy = 0; iy <= hSegs; iy++) {
    let y = iy * segH - height / 2;
    for (let ix = 0; ix <= wSegs; ix++, i++) {
      let x = ix * segW - width / 2;

      position[i * 3 + u] = x * uDir;
      position[i * 3 + v] = y * vDir;
      position[i * 3 + w] = depth / 2;

      normal[i * 3 + u] = 0;
      normal[i * 3 + v] = 0;
      normal[i * 3 + w] = depth >= 0 ? 1 : -1;

      uv[i * 2] = ix / wSegs;
      uv[i * 2 + 1] = 1 - iy / hSegs;

      if (iy === hSegs || ix === wSegs) continue;
      let a = io + ix + iy * (wSegs + 1);
      let b = io + ix + (iy + 1) * (wSegs + 1);
      let c = io + ix + (iy + 1) * (wSegs + 1) + 1;
      let d = io + ix + iy * (wSegs + 1) + 1;

      index[ii * 6] = a;
      index[ii * 6 + 1] = b;
      index[ii * 6 + 2] = d;
      index[ii * 6 + 3] = b;
      index[ii * 6 + 4] = c;
      index[ii * 6 + 5] = d;
      ii++;
    }
  }

  return {
    position: { size: 3, data: position },
    normal: { size: 3, data: normal },
    uv: { size: 2, data: uv },
    index: { data: index },
  };
};

const plane = buildPlane(1, 1, FRAGMENTS, 1);

const meshesCount = LINES_COUNT;

const idxArr = [];
const useColorArr = [];
const offsetArr = [];

let idx = 0;
for (let n = 0; n < meshesCount * 3; n += 1) {
  for (let i = 0; i < 3; i += 1) {
    const step = i === 1 ? SHADOW_SIZE : LINE_SIZE;
    idxArr[idx] = n - meshesCount / 2;
    useColorArr[idx] = i === 1 ? 1 : 0;
    offsetArr[idx] =
      i * step + (n - meshesCount / 2) * VERT_ACCURACY - COMMON_OFFSET;

    idx += 1;
  }
}

console.log(offsetArr);

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSrc);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
  throw new Error(
    `could not compile shader: ${gl.getShaderInfoLog(vertexShader) || ''}`,
  );
}

const pixelShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(pixelShader, fragmentShaderSrc);
gl.compileShader(pixelShader);
if (!gl.getShaderParameter(pixelShader, gl.COMPILE_STATUS)) {
  throw new Error(
    `could not compile shader: ${gl.getShaderInfoLog(pixelShader) || ''}`,
  );
}

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, pixelShader);
gl.linkProgram(program);
gl.useProgram(program);

const positionLoc = gl.getAttribLocation(program, 'a_position');
const idxLoc = gl.getAttribLocation(program, 'a_idx');
const useColorLoc = gl.getAttribLocation(program, 'a_useColor');
const offsetLoc = gl.getAttribLocation(program, 'a_offset');

const iTimeLoc = gl.getUniformLocation(program, 'iTime');
const iResolutionLoc = gl.getUniformLocation(program, 'iResolution');
const sizeFactorLoc = gl.getUniformLocation(program, 'sizeFactor');
const countLoc = gl.getUniformLocation(program, 'count');
const backColorLoc = gl.getUniformLocation(program, 'backColor');

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, plane.position.data, gl.STATIC_DRAW);

const idxBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, idxBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(idxArr), gl.STATIC_DRAW);

const useColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, useColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(useColorArr), gl.STATIC_DRAW);

const offsetBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(offsetArr), gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, plane.index.data, gl.STATIC_DRAW);

// ----------

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, idxBuffer);
gl.enableVertexAttribArray(idxLoc);
gl.vertexAttribPointer(idxLoc, 1, gl.FLOAT, false, 0, 0);
ext.vertexAttribDivisorANGLE(idxLoc, 1);

gl.bindBuffer(gl.ARRAY_BUFFER, useColorBuffer);
gl.enableVertexAttribArray(useColorLoc);
gl.vertexAttribPointer(useColorLoc, 1, gl.FLOAT, false, 0, 0);
ext.vertexAttribDivisorANGLE(useColorLoc, 1);

gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
gl.enableVertexAttribArray(offsetLoc);
gl.vertexAttribPointer(offsetLoc, 1, gl.FLOAT, false, 0, 0);
ext.vertexAttribDivisorANGLE(offsetLoc, 1);

function loop(time) {
  resizeCanvasToDisplaySize(canvas);

  gl.clearColor(BACK_COLOR[0], BACK_COLOR[1], BACK_COLOR[2], 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform1f(iTimeLoc, time / 1000);
  gl.uniform1f(
    sizeFactorLoc,
    (canvas.clientWidth * devicePixelRatio) / CONGESTION,
  );
  gl.uniform1f(countLoc, meshesCount);
  gl.uniform3fv(backColorLoc, BACK_COLOR);
  gl.uniform2f(
    iResolutionLoc,
    canvas.clientWidth * devicePixelRatio,
    canvas.clientHeight * devicePixelRatio,
  );

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // gl.drawElements(gl.TRIANGLES, plane.index.data.length, gl.UNSIGNED_SHORT, 0);
  ext.drawElementsInstancedANGLE(
    gl.TRIANGLES,
    plane.index.data.length,
    gl.UNSIGNED_SHORT,
    0,
    meshesCount * 3,
  );

  window.requestAnimationFrame(loop);
}
loop();
