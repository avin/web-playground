import { createProgram, createShader, resizeCanvasToDisplaySize } from '../utils';

import fragmentShaderSource from './shaders/fragment.glsl';
import vertexShaderSource from './shaders/vertext.glsl';

void (() => {
  const items = new Array(2000).fill(null).map(() => {
    return {
      color: [Math.random(), Math.random(), Math.random()],
      offset: [Math.random() * 2 - 1, Math.random() * 2 - 1],
      rotation: [Math.PI * 2 * Math.random()],
    };
  });

  const canvas: HTMLCanvasElement | null = document.querySelector('#canvas');
  if (!canvas) {
    throw new Error('no canvas');
  }

  const gl = canvas.getContext('webgl2');
  if (!gl) {
    throw new Error('no gl context');
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  const program = createProgram(gl, vertexShader, fragmentShader);

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const offsetAttributeLocation = gl.getAttribLocation(program, 'a_offset');
  const rotationAttributeLocation = gl.getAttribLocation(program, 'a_rotation');
  const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
  const speedAttributeLocation = gl.getAttribLocation(program, 'a_speed');

  const timeLocation = gl.getUniformLocation(program, 'u_time');

  const numInstances = items.length;

  const offsetData = new Float32Array(numInstances * 2);
  const rotationData = new Float32Array(numInstances * 1);
  const colorData = new Float32Array(numInstances * 3);
  const speedData = new Float32Array(numInstances * 1);

  const colorsStorage: Float32Array[] = [];
  const rotationsStorage: Float32Array[] = [];
  const offsetsStorage: Float32Array[] = [];
  const speedsStorage: Float32Array[] = [];
  for (let i = 0; i < numInstances; i += 1) {
    offsetsStorage.push(new Float32Array(offsetData.buffer, i * 2 * 4, 2));
    rotationsStorage.push(new Float32Array(rotationData.buffer, i * 1 * 4, 1));
    colorsStorage.push(new Float32Array(colorData.buffer, i * 3 * 4, 3));
    speedsStorage.push(new Float32Array(speedData.buffer, i * 1 * 4, 1));
  }

  offsetsStorage.forEach((item) => {
    item[0] = Math.random() * 2 - 1;
    item[1] = Math.random() * 2 - 1;
  });

  rotationsStorage.forEach((item) => {
    item[0] = Math.random();
  });

  colorsStorage.forEach((item) => {
    item[0] = Math.random();
    item[1] = Math.random();
    item[2] = Math.random();
  });

  speedsStorage.forEach((item) => {
    item[0] = Math.random() * 2 + 0.5;
  });

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  {
    /* ======== POSITION ========= */

    /* prettier-ignore */
    const positions = new Float32Array([
      -0.05, -0.05,
      0.05, -0.05,
      0.05, 0.05,
      -0.05, 0.05,
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

    /* ======== INDICES ========= */

    /* prettier-ignore */
    const indices = new Uint16Array([
      0, 1, 3,   // first triangle
      3, 1, 2,   // second triangle
    ]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    /* ======== OFFSETS ========= */

    const offsetBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, offsetData, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(offsetAttributeLocation);
    gl.vertexAttribPointer(offsetAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(offsetAttributeLocation, 1);

    /* ======== ROTATIONS ========= */

    const rotationBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rotationBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rotationData, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(rotationAttributeLocation);
    gl.vertexAttribPointer(rotationAttributeLocation, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(rotationAttributeLocation, 1);

    /* ======== COLORS ========= */

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(colorAttributeLocation, 1);

    /* ======== SPEEDS ========= */

    const speedBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, speedBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, speedData, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(speedAttributeLocation);
    gl.vertexAttribPointer(speedAttributeLocation, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(speedAttributeLocation, 1);

    /* ======== CLEAN ========= */

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  const startTime = +new Date();

  (function frame() {
    const time = (+new Date() - startTime) / 1000;

    const isNeedResize = resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
    if (isNeedResize) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    gl.uniform1f(timeLocation, time);

    gl.bindVertexArray(vao);

    gl.drawElementsInstanced(
      gl.TRIANGLES,
      6, // count
      gl.UNSIGNED_SHORT, // indexType
      0, // offset
      numInstances, // num instances
    );

    // gl.drawElements(
    //   gl.TRIANGLES, // primitiveType
    //   6, // count
    //   gl.UNSIGNED_SHORT, // indexType
    //   0, // offset
    // );

    requestAnimationFrame(frame);
  })();
})();
