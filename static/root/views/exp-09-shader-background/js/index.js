// @process

import fragmentShaderSrc from './shaders/fragment.glsl';
import vertexShaderSrc from './shaders/vertex.glsl';

window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

function BackgroundAnimation() {
  const canvas = document.querySelector('.background-shader');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  let time = 0;

  const resize = () => {
    // Lookup the size the browser is displaying the canvas.
    const displayWidth = document.body.clientWidth;
    const displayHeight = document.body.clientHeight;

    // Check if the canvas is not the same size.
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      // Make the canvas the same size
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  };

  resize();
  time = 0;

  const vertices = [-1, -1, -1, 1, 1, -1, 1, 1, -1, 1, 1, -1];
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSrc);
  gl.compileShader(vertexShader);

  const pixelShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(pixelShader, fragmentShaderSrc);
  gl.compileShader(pixelShader);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, pixelShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  const coordinates = gl.getAttribLocation(program, 'position');
  gl.vertexAttribPointer(coordinates, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordinates);

  this.loop = () => {
    window.requestAnimFrame(this.loop);
    time += 1 / 60;
    gl.uniform1f(gl.getUniformLocation(program, 'iTime'), time);
    gl.uniform2f(gl.getUniformLocation(program, 'iResolution'), document.body.clientWidth, document.body.clientHeight);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  window.addEventListener('resize', () => {
    resize();
  });
}

function ready(fn) {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => {
  document.querySelector('.root').classList.add('root_ready');

  const animation = new BackgroundAnimation();
  animation.loop();
});
