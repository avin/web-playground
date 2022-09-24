import * as twgl from 'twgl.js';

import fragmentShaderSource from './shaders/fragment.glsl';
import vertexShaderSource from './shaders/vertext.glsl';

void (() => {
  const canvas: HTMLCanvasElement | null = document.querySelector('#canvas');
  if (!canvas) {
    throw new Error('no canvas');
  }

  const gl = canvas.getContext('webgl2');
  if (!gl) {
    throw new Error('no gl context');
  }

  const programInfo = twgl.createProgramInfo(gl, [
    vertexShaderSource,
    fragmentShaderSource,
  ]);

  /* prettier-ignore */
  const arrays = {
    a_position: { numComponents: 2, data: [
      -1, -1,
      1, -1,
      1, 1,
      -1, 1,
    ]},
    indices: { numComponents: 3, data: [
      0, 1, 3,   // first triangle
      3, 1, 2,   // second triangle
    ]},
  };
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

  function render(time) {
    twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const uniforms = {
      u_time: time * 0.001,
      u_resolution: [gl.canvas.width, gl.canvas.height],
    };

    gl.useProgram(programInfo.program);

    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
