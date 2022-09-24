import {
  createProgram,
  createShader,
  resizeCanvasToDisplaySize,
} from '../../_common/utils';

import fragmentShaderSource from './shaders/fragment.glsl';
import vertexShaderSource from './shaders/vertext.glsl';

const getColorsArr = () => {
  /* prettier-ignore */
  return new Uint8Array([
    Math.random() * 256, Math.random() * 256, Math.random() * 256, 255,
    Math.random() * 256, Math.random() * 256, Math.random() * 256, 255,
    Math.random() * 256, Math.random() * 256, Math.random() * 256, 255,
  ])
};

const canvas: HTMLCanvasElement | null = document.querySelector('#canvas');
if (!canvas) {
  throw new Error('no canvas');
}

const gl = canvas.getContext('webgl2');
if (!gl) {
  throw new Error('no gl context');
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(
  gl,
  gl.FRAGMENT_SHADER,
  fragmentShaderSource,
);

const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const colorBuffer = gl.createBuffer();
{
  /* ======== POSITION ========= */

  const positions =
    /* prettier-ignore */ new Float32Array([
    -0.8, -0.8,
    -0.8, 0.8,
    0.9, .25,
  ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(
    positionAttributeLocation,
    2, // size - 2 components per iteration
    gl.FLOAT, // type - the data is 32bit floats
    false, // normalize - don't normalize the data
    0, // stride  - 0 = move forward size * sizeof(type) each iteration to get the next position
    0, // offset - start at the beginning of the buffer
  );

  /* ======== COLORS ========= */

  const colorsArr = getColorsArr();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colorsArr, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.vertexAttribPointer(
    colorAttributeLocation,
    4, // size - 2 components per iteration
    gl.UNSIGNED_BYTE, // type - the data is 32bit floats
    true, // normalize - don't normalize the data
    0, // stride  - 0 = move forward size * sizeof(type) each iteration to get the next position
    0, // offset - start at the beginning of the buffer
  );
}

const startTime = +new Date();
let lastTime;
(function frame() {
  const time = (+new Date() - startTime) / 1000;

  if (Math.floor(time * 4) !== Math.floor(lastTime * 4)) {
    lastTime = time;

    /* ======= UPDATE COLOR ========= */

    /* prettier-ignore */
    const colorsArr = getColorsArr();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorsArr, gl.STATIC_DRAW);
  }

  const isNeedResize = resizeCanvasToDisplaySize(
    gl.canvas as HTMLCanvasElement,
  );
  if (isNeedResize) {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  gl.drawArrays(
    gl.TRIANGLES, // primitiveType
    0, // offset
    3, // count
  );

  requestAnimationFrame(frame);
})();
