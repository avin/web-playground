import"../../modulepreload-polyfill-B5Qt9EMX.js";import{c as s,a as m,r as v}from"../../utils--pvlLDmQ.js";const d=`#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform vec3 triColor;
uniform float time;
uniform float speed;
uniform float useVColor;

in vec4 v_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  vec3 col = triColor;
  col.g = (sin(time * 10. * speed) * .5 + .5);

  if (useVColor == 1.) {
    outColor = v_color;
  } else {
    outColor = vec4(col, 1);
  }
}
`,A=`#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;

uniform float time;
uniform float speed;

out vec4 v_color;

void rotate(in float angle, inout vec2 uv) {
  float ca = cos(angle);
  float sa = sin(angle);
  uv *= mat2(ca, -sa, sa, ca);
}

// all shaders have a main function
void main() {

  vec2 pos = a_position.xy;

  rotate(time * speed, pos);

  gl_Position = vec4(pos, 0., 1.);

  v_color = gl_Position * .5 + .5;
}
`,c=document.querySelector("#canvas");if(!c)throw new Error("no canvas");const e=c.getContext("webgl2");if(!e)throw new Error("no gl context");const p=s(e,e.VERTEX_SHADER,A),g=s(e,e.FRAGMENT_SHADER,d),o=m(e,p,g),r=e.getAttribLocation(o,"a_position"),t=e.getUniformLocation(o,"triColor"),R=e.getUniformLocation(o,"time"),a=e.getUniformLocation(o,"speed"),i=e.getUniformLocation(o,"useVColor"),f=e.createVertexArray();e.bindVertexArray(f);{const n=new Float32Array([0,0,0,.5,.7,0]);e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,n,e.STATIC_DRAW),e.enableVertexAttribArray(r),e.vertexAttribPointer(r,2,e.FLOAT,!1,0,0)}const l=e.createVertexArray();e.bindVertexArray(l);{const n=new Float32Array([.5,.5,1,.5,.25,0]);e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,n,e.STATIC_DRAW),e.enableVertexAttribArray(r),e.vertexAttribPointer(r,2,e.FLOAT,!1,0,0)}const h=+new Date;(function n(){v(e.canvas)&&e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(o);const u=(+new Date-h)/1e3;e.uniform1f(R,u),e.bindVertexArray(f),e.uniform1f(a,1),e.uniform1f(i,0),e.uniform3fv(t,[1,.7,.7]),e.drawArrays(e.TRIANGLES,0,3),e.bindVertexArray(l),e.uniform1f(a,2),e.uniform1f(i,1),e.uniform3fv(t,[.5,1,.7]),e.drawArrays(e.TRIANGLES,0,3),requestAnimationFrame(n)})();
