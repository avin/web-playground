import {
  createProgram,
  createShader,
  resizeCanvasToDisplaySize,
} from '../utils';

import fragmentShaderSource from './shaders/fragment.glsl';
import vertexShaderSource from './shaders/vertext.glsl';

const loadImage = (url) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = url;
    image.onload = () => {
      resolve(image);
    };
  });
};

void (async () => {
  const images = await Promise.all([
    loadImage('./img/Di-3d.png'),
    loadImage('./img/leaves.jpg'),
  ]);

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
  const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');

  const image1Location = gl.getUniformLocation(program, 'u_image1');
  const image2Location = gl.getUniformLocation(program, 'u_image2');
  const timeLocation = gl.getUniformLocation(program, 'u_time');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

  const createTexture = (textureIndex: number, image: ImageBitmap) => {
    const texture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0 + textureIndex);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // mipLevel,
      gl.RGBA, // internalFormat,
      gl.RGBA, // srcFormat,
      gl.UNSIGNED_BYTE, // srcType,
      image,
    );

    return texture;
  };

  const texture1 = createTexture(0, images[0] as ImageBitmap);
  const texture2 = createTexture(1, images[1] as ImageBitmap);

  const vao1 = gl.createVertexArray();
  gl.bindVertexArray(vao1);

  {
    /* ======== POSITION ========= */

    /* prettier-ignore */
    const positions = new Float32Array([
      -0.5, -0.5,
      0.5, -0.5,
      0.5, 0.5,
      -0.5, 0.5,
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

    /* ======== TEX_COORDS ========= */

    /* prettier-ignore */
    const texCoords = new Float32Array([
      0.0,  1.0,
      1.0,  1.0,
      1.0,  0.0,
      0.0,  0.0,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(texCoordAttributeLocation);
    gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    /* ======== INDICES ========= */

    /* prettier-ignore */
    const indices = new Uint16Array([
      0, 1, 3,   // first triangle
      3, 1, 2,   // second triangle
    ]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW,
    );

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  const vao2 = gl.createVertexArray();
  gl.bindVertexArray(vao2);

  {
    /* ======== POSITION ========= */

    /* prettier-ignore */
    const positions = new Float32Array([
      -0.9, -0.7,
      -0.7, -0.9,
      -0.5, -0.7,
      -0.7, -0.5,
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

    /* ======== TEX_COORDS ========= */

    /* prettier-ignore */
    const texCoords = new Float32Array([
      0.0,  1.0,
      1.0,  1.0,
      1.0,  0.0,
      0.0,  0.0,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(texCoordAttributeLocation);
    gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    /* ======== INDICES ========= */

    /* prettier-ignore */
    const indices = new Uint16Array([
      0, 1, 2,   // first triangle
      2, 3, 0,   // second triangle
    ]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW,
    );

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  const vao3 = gl.createVertexArray();
  gl.bindVertexArray(vao3);

  {
    /* ======== POSITION ========= */

    /* prettier-ignore */
    const positions = new Float32Array([
      0.5, 0.8,
      0.6, 0.6,
      0.7, 0.8,
      0.8, 0.6,
      0.9, 0.8,
      1.0, 0.6,
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

    /* ======== TEX_COORDS ========= */

    /* prettier-ignore */
    const texCoords = new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      1.0,  0.0,
      0.0,  1.0,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(texCoordAttributeLocation);
    gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    /* ======== INDICES ========= */

    /* prettier-ignore */
    const indices = new Uint16Array([
      0, 2, 1,   // 1
      3, 4, 5,   // 2
    ]);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW,
    );

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  const startTime = +new Date();

  (function frame() {
    const time = (+new Date() - startTime) / 1000;

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

    gl.uniform1i(image1Location, 0);
    gl.uniform1i(image2Location, 1);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);

    gl.uniform1f(timeLocation, time);
    gl.uniform2fv(resolutionLocation, [gl.canvas.width, gl.canvas.height]);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao1);

    gl.drawElements(
      gl.TRIANGLES, // primitiveType
      6, // count
      gl.UNSIGNED_SHORT, // indexType
      0, // offset
    );

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao2);

    gl.drawElements(
      gl.TRIANGLES, // primitiveType
      6, // count
      gl.UNSIGNED_SHORT, // indexType
      0, // offset
    );

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao3);

    gl.drawElements(
      gl.TRIANGLES, // primitiveType
      6, // count
      gl.UNSIGNED_SHORT, // indexType
      0, // offset
    );

    gl.bindVertexArray(null);

    requestAnimationFrame(frame);
  })();
})();
