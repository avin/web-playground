import {
  createProgram,
  createShader,
  resizeCanvasToDisplaySize,
} from '../../_common/utils';
import fragmentShaderSource from './shaders/fragment.glsl?raw';
import vertexShaderSource from './shaders/vertext.glsl?raw';

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
const triColorLoc = gl.getUniformLocation(program, 'triColor');
const timeLoc = gl.getUniformLocation(program, 'time');
const speedLoc = gl.getUniformLocation(program, 'speed');
const useVColorLoc = gl.getUniformLocation(program, 'useVColor');

const vao1 = gl.createVertexArray();
gl.bindVertexArray(vao1);

{
  const positions =
    /* prettier-ignore */ new Float32Array([
    0, 0,
    0, 0.5,
    0.7, 0,
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
}

// --------------

const vao2 = gl.createVertexArray();
gl.bindVertexArray(vao2);

{
  const positions =
    /* prettier-ignore */ new Float32Array([
    .5, .5,
     1, .5,
    .25, 0,
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
}

const startTime = +new Date();
(function frame() {
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

  const time = (+new Date() - startTime) / 1000;
  gl.uniform1f(timeLoc, time);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao1);

  gl.uniform1f(speedLoc, 1);
  gl.uniform1f(useVColorLoc, 0);

  gl.uniform3fv(triColorLoc, [1, 0.7, 0.7]);

  gl.drawArrays(
    gl.TRIANGLES, // primitiveType
    0, // offset
    3, // count
  );

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao2);

  gl.uniform1f(speedLoc, 2);
  gl.uniform1f(useVColorLoc, 1);

  gl.uniform3fv(triColorLoc, [0.5, 1.0, 0.7]);

  gl.drawArrays(
    gl.TRIANGLES, // primitiveType
    0, // offset
    3, // count
  );

  requestAnimationFrame(frame);
})();
