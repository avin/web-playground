import"../../modulepreload-polyfill-B5Qt9EMX.js";import{c as E,a as B,r as g}from"../../utils--pvlLDmQ.js";const D=`#version 300 es

precision highp float;

uniform sampler2D u_image1;
uniform sampler2D u_image2;

uniform float u_time;

in vec2 v_texCoord;

out vec4 outColor;

vec3 getCol1(vec2 uv) {
  vec3 col = texture(u_image1, uv).rgb;

  float t = u_time * 10.;
  float offsetFactor = t + v_texCoord.x * 10.;
  bool isHair = !((abs(col.r - col.g) < .25) && (abs(col.g - col.b) < .25));
  if (isHair) {
    col.r = texture(u_image1, v_texCoord + vec2(sin(offsetFactor) * .01, 0.)).r;
    col.g = texture(u_image1, v_texCoord - vec2(cos(offsetFactor) * .01, 0.)).g;
  }

  return col;
}

vec3 getCol2(vec2 uv) {
  vec3 col = texture(u_image2, uv).rgb;

  float t = u_time * 5.;
  float offsetFactor = t + v_texCoord.y * 20.;

  col.r = texture(u_image2, v_texCoord + vec2(sin(offsetFactor) * .01, 0.)).r;
  col.g = texture(u_image2, v_texCoord - vec2(cos(offsetFactor) * .01, 0.)).g;

  return col;
}

void main() {
  float s = sin(u_time) * .6 + .5;
  float f = smoothstep(-.1 + s, .1 + s, v_texCoord.x);

  vec2 uv = v_texCoord;

  vec3 col1 = getCol1(uv);
  vec3 col2 = getCol2(uv);

  vec3 col = mix(col1, col2, f);

  outColor = vec4(col, 1.);
}
`,C=`#version 300 es

in vec4 a_position;
in vec2 a_texCoord;

uniform vec2 u_resolution;

out vec2 v_texCoord;

void main() {
  vec4 pos = a_position;
  pos.x *= u_resolution.y / u_resolution.x;

  gl_Position = pos;
  v_texCoord = a_texCoord;
}
`,_=c=>new Promise(A=>{const e=new Image;e.src=c,e.onload=()=>{A(e)}});(async()=>{const c=await Promise.all([_("../assets/img/Di-3d.png"),_("../assets/img/leaves.jpg")]),A=document.querySelector("#canvas");if(!A)throw new Error("no canvas");const e=A.getContext("webgl2");if(!e)throw new Error("no gl context");const l=E(e,e.VERTEX_SHADER,C),T=E(e,e.FRAGMENT_SHADER,D),o=B(e,l,T),a=e.getAttribLocation(o,"a_position"),i=e.getAttribLocation(o,"a_texCoord"),x=e.getUniformLocation(o,"u_image1"),F=e.getUniformLocation(o,"u_image2"),v=e.getUniformLocation(o,"u_time"),d=e.getUniformLocation(o,"u_resolution"),s=(t,r)=>{const n=e.createTexture();return e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,r),n},b=s(0,c[0]),m=s(1,c[1]),R=e.createVertexArray();e.bindVertexArray(R);{const t=new Float32Array([-.5,-.5,.5,-.5,.5,.5,-.5,.5]);e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW),e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0);const r=new Float32Array([0,1,1,1,1,0,0,0]);e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,r,e.STATIC_DRAW),e.enableVertexAttribArray(i),e.vertexAttribPointer(i,2,e.FLOAT,!1,0,0);const n=new Uint16Array([0,1,3,3,1,2]);e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(n),e.STATIC_DRAW),e.bindVertexArray(null),e.bindBuffer(e.ARRAY_BUFFER,null),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,null)}const f=e.createVertexArray();e.bindVertexArray(f);{const t=new Float32Array([-.9,-.7,-.7,-.9,-.5,-.7,-.7,-.5]);e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW),e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0);const r=new Float32Array([0,1,1,1,1,0,0,0]);e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,r,e.STATIC_DRAW),e.enableVertexAttribArray(i),e.vertexAttribPointer(i,2,e.FLOAT,!1,0,0);const n=new Uint16Array([0,1,2,2,3,0]);e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(n),e.STATIC_DRAW),e.bindVertexArray(null),e.bindBuffer(e.ARRAY_BUFFER,null),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,null)}const u=e.createVertexArray();e.bindVertexArray(u);{const t=new Float32Array([.5,.8,.6,.6,.7,.8,.8,.6,.9,.8,1,.6]);e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW),e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0);const r=new Float32Array([0,0,1,0,1,1,1,0,0,1]);e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,r,e.STATIC_DRAW),e.enableVertexAttribArray(i),e.vertexAttribPointer(i,2,e.FLOAT,!1,0,0);const n=new Uint16Array([0,2,1,3,4,5]);e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(n),e.STATIC_DRAW),e.bindVertexArray(null),e.bindBuffer(e.ARRAY_BUFFER,null),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,null)}const U=+new Date;(function t(){const r=(+new Date-U)/1e3;g(e.canvas)&&e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(o),e.uniform1i(x,0),e.uniform1i(F,1),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,b),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,m),e.uniform1f(v,r),e.uniform2fv(d,[e.canvas.width,e.canvas.height]),e.bindVertexArray(R),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0),e.bindVertexArray(f),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0),e.bindVertexArray(u),e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0),e.bindVertexArray(null),requestAnimationFrame(t)})()})();
