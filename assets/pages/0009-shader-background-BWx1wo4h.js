import"../modulepreload-polyfill-B5Qt9EMX.js";const h=`// Original shader https://www.shadertoy.com/view/WsSXzt

precision lowp float;
uniform float iTime;
uniform vec2 iResolution;

void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;

    vec2 gv = uv * 50.0 ;
    gv = fract(gv) - 0.5;

    float t = iTime * 5.0;

    float s = (sin(t - length(uv * 2.0) * 5.0) * 0.4 + 0.5) * 0.6;
    float m = smoothstep(s, s - 0.05, length(gv)) + s*2.0;

    vec3 col = vec3(s, 0.0, 0.5) * m;

    gl_FragColor = vec4(col, 1.0);
}
`,c=`attribute vec2 position;
void main(void)
{
    gl_Position = vec4(position,0.0,1.0);
}
`,l=(function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(i){window.setTimeout(i,1e3/60)}})();class s{canvas;gl;program;time=0;constructor(){const t=document.querySelector(".background-shader");if(!t)throw new Error("Canvas not found");const e=t.getContext("webgl")||t.getContext("experimental-webgl");if(!e)throw new Error("WebGL not supported");this.canvas=t,this.gl=e,this.init()}init(){this.resize(),this.time=0;const t=[-1,-1,-1,1,1,-1,1,1,-1,1,1,-1],e=this.gl.createBuffer();if(!e)throw new Error("Failed to create buffer");this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(t),this.gl.STATIC_DRAW);const n=this.gl.createShader(this.gl.VERTEX_SHADER);if(!n)throw new Error("Failed to create vertex shader");this.gl.shaderSource(n,c),this.gl.compileShader(n);const r=this.gl.createShader(this.gl.FRAGMENT_SHADER);if(!r)throw new Error("Failed to create fragment shader");this.gl.shaderSource(r,h),this.gl.compileShader(r);const o=this.gl.createProgram();if(!o)throw new Error("Failed to create program");this.gl.attachShader(o,n),this.gl.attachShader(o,r),this.gl.linkProgram(o),this.gl.useProgram(o),this.program=o;const a=this.gl.getAttribLocation(o,"position");this.gl.vertexAttribPointer(a,2,this.gl.FLOAT,!1,0,0),this.gl.enableVertexAttribArray(a),window.addEventListener("resize",()=>{this.resize()})}resize(){const t=document.body.clientWidth,e=document.body.clientHeight;(this.canvas.width!==t||this.canvas.height!==e)&&(this.canvas.width=t,this.canvas.height=e),this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height)}loop=()=>{l(this.loop),this.time+=1/60,this.gl.uniform1f(this.gl.getUniformLocation(this.program,"iTime"),this.time),this.gl.uniform2f(this.gl.getUniformLocation(this.program,"iResolution"),document.body.clientWidth,document.body.clientHeight),this.gl.drawArrays(this.gl.TRIANGLES,0,6)}}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{const i=document.querySelector(".root");i&&i.classList.add("root_ready");try{new s().loop()}catch(t){console.error("Failed to initialize background animation:",t)}});else{const i=document.querySelector(".root");i&&i.classList.add("root_ready");try{new s().loop()}catch(t){console.error("Failed to initialize background animation:",t)}}
