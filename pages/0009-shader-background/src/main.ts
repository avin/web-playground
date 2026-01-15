import './main.scss';
import fragmentShaderSrc from './shaders/fragment.glsl?raw';
import vertexShaderSrc from './shaders/vertex.glsl?raw';

const requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    (window as any).mozRequestAnimationFrame ||
    (window as any).oRequestAnimationFrame ||
    (window as any).msRequestAnimationFrame ||
    function (callback: FrameRequestCallback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

class BackgroundAnimation {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private time = 0;

  constructor() {
    const canvas = document.querySelector(
      '.background-shader',
    ) as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas not found');

    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) throw new Error('WebGL not supported');

    this.canvas = canvas;
    this.gl = gl;

    this.init();
  }

  private init() {
    this.resize();
    this.time = 0;

    const vertices = [-1, -1, -1, 1, 1, -1, 1, 1, -1, 1, 1, -1];
    const buffer = this.gl.createBuffer();
    if (!buffer) throw new Error('Failed to create buffer');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      this.gl.STATIC_DRAW,
    );

    const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    if (!vertexShader) throw new Error('Failed to create vertex shader');
    this.gl.shaderSource(vertexShader, vertexShaderSrc);
    this.gl.compileShader(vertexShader);

    const pixelShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    if (!pixelShader) throw new Error('Failed to create fragment shader');
    this.gl.shaderSource(pixelShader, fragmentShaderSrc);
    this.gl.compileShader(pixelShader);

    const program = this.gl.createProgram();
    if (!program) throw new Error('Failed to create program');
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, pixelShader);
    this.gl.linkProgram(program);
    this.gl.useProgram(program);

    this.program = program;

    const coordinates = this.gl.getAttribLocation(program, 'position');
    this.gl.vertexAttribPointer(coordinates, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(coordinates);

    window.addEventListener('resize', () => {
      this.resize();
    });
  }

  private resize() {
    // Lookup the size the browser is displaying the canvas.
    const displayWidth = document.body.clientWidth;
    const displayHeight = document.body.clientHeight;

    // Check if the canvas is not the same size.
    if (
      this.canvas.width !== displayWidth ||
      this.canvas.height !== displayHeight
    ) {
      // Make the canvas the same size
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
    }

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  }

  loop = () => {
    requestAnimFrame(this.loop);
    this.time += 1 / 60;
    this.gl.uniform1f(
      this.gl.getUniformLocation(this.program, 'iTime'),
      this.time,
    );
    this.gl.uniform2f(
      this.gl.getUniformLocation(this.program, 'iResolution'),
      document.body.clientWidth,
      document.body.clientHeight,
    );
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('.root');
    if (root) {
      root.classList.add('root_ready');
    }

    try {
      const animation = new BackgroundAnimation();
      animation.loop();
    } catch (e) {
      console.error('Failed to initialize background animation:', e);
    }
  });
} else {
  const root = document.querySelector('.root');
  if (root) {
    root.classList.add('root_ready');
  }

  try {
    const animation = new BackgroundAnimation();
    animation.loop();
  } catch (e) {
    console.error('Failed to initialize background animation:', e);
  }
}
