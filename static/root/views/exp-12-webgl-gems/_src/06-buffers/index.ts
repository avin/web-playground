import {
  createAndSetupTexture,
  createProgram,
  createShader,
  resizeCanvasToDisplaySize,
  setCanvasSizeForTexture,
} from '../utils';

import bufferAShaderSource from './shaders/bufferA.glsl';
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

  // ----------

  const makeAttributes = ({ positionAttributeLocation, uvAttributeLocation }) => {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    /* ======== POSITION ========= */

    /* prettier-ignore */
    const positions = new Float32Array([
        -1, -1,
        1, -1,
        1, 1,
        -1, 1,
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

    /* ======== UV ========= */

    /* prettier-ignore */
    const uvBufferData = new Float32Array([
        0, 0,
        1, 0,
        1, 1,
        0, 1,
      ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, uvBufferData, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(uvAttributeLocation);
    gl.vertexAttribPointer(
      uvAttributeLocation,
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

    /* ======== CLEAN ========= */

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return vao;
  };

  const imageProgramObj = (() => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const uvAttributeLocation = gl.getAttribLocation(program, 'a_uv');

    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const imageLocation = gl.getUniformLocation(program, 'u_image');

    const vao = makeAttributes({ positionAttributeLocation, uvAttributeLocation });

    return {
      vao,
      program,
      uniforms: {
        timeLocation,
        resolutionLocation,
        imageLocation,
      },
    };
  })();

  const bufferAProgramObj = (() => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, bufferAShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const uvAttributeLocation = gl.getAttribLocation(program, 'a_uv');

    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const imageLocation = gl.getUniformLocation(program, 'u_image');

    const vao = makeAttributes({ positionAttributeLocation, uvAttributeLocation });

    return {
      vao,
      program,
      uniforms: {
        timeLocation,
        resolutionLocation,
        imageLocation,
      },
    };
  })();

  const backTexture = createAndSetupTexture(gl);
  const texture = createAndSetupTexture(gl);

  // Create a framebuffer
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, 0);

  const startTime = +new Date();

  (function frame() {
    const time = (+new Date() - startTime) / 1000;

    const isNeedResize = resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
    if (isNeedResize) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      setCanvasSizeForTexture(gl, texture);
      setCanvasSizeForTexture(gl, backTexture);
    }

    // Clear the canvas
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // -----------------------------

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(bufferAProgramObj.program);

    gl.uniform1f(bufferAProgramObj.uniforms.timeLocation, time);
    gl.uniform2fv(bufferAProgramObj.uniforms.resolutionLocation, [gl.canvas.width, gl.canvas.height]);

    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, backTexture);
    gl.uniform1i(bufferAProgramObj.uniforms.imageLocation, 0);

    gl.bindVertexArray(bufferAProgramObj.vao);

    gl.drawElements(
      gl.TRIANGLES,
      6, // count
      gl.UNSIGNED_SHORT, // indexType
      0, // offset
    );

    gl.bindVertexArray(null);

    gl.bindTexture(gl.TEXTURE_2D, backTexture);
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, canvas.clientWidth, canvas.clientHeight, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // -----------------------------

    // Tell it to use our program (pair of shaders)
    gl.useProgram(imageProgramObj.program);

    gl.bindVertexArray(imageProgramObj.vao);

    gl.uniform1f(imageProgramObj.uniforms.timeLocation, time);
    gl.uniform2fv(imageProgramObj.uniforms.resolutionLocation, [gl.canvas.width, gl.canvas.height]);

    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.uniform1i(imageProgramObj.uniforms.imageLocation, 0);

    gl.drawElements(
      gl.TRIANGLES,
      6, // count
      gl.UNSIGNED_SHORT, // indexType
      0, // offset
    );

    gl.bindVertexArray(null);

    requestAnimationFrame(frame);
  })();
})();
