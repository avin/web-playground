import"../../modulepreload-polyfill-B5Qt9EMX.js";import{c as v,a as E,b as g,r as x,s as b}from"../../utils--pvlLDmQ.js";const p=`#version 300 es

precision highp float;

in vec2 v_uv;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_image;

out vec4 outColor;

#define hue(h) clamp( abs( fract(h + vec4(3,2,1,0)/3.) * 6. - 3.) -1. , 0., 1.)

vec2 rand( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

void main() {
  vec2 ouv = v_uv;
  vec2 uv = v_uv - vec2(.5);
  uv.x *= u_resolution.x / u_resolution.y;

  vec2 luv = uv;

  uv *= 10. + sin(u_time * .5) * 3.;

  vec2 iuv = floor(uv);
  vec2 guv = fract(uv);

  float mDist = 1.0;

  vec3 col = vec3(0.);

  for (float y = -1.; y <= 1.; y++) {
    for (float x = -1.; x <= 1.; x++) {
      vec2 neighbor = vec2(x, y);
      vec2 point = rand(iuv + neighbor);
      point = 0.5 + 0.5 * sin(u_time * 2. + 6.2831 * point);
      vec2 diff = neighbor + point - guv;
      float dist = length(diff);

      mDist = min(mDist, dist);
    }
  }

  float l = length(luv);
  col = hue(fract(mDist * .95 + u_time * .1 + l)).rgb;

  outColor = vec4(col, 1.0) * .05 + texture(u_image, ouv) * .95;
}
`,L=`#version 300 es

precision highp float;

in vec2 v_uv;
uniform sampler2D u_image;

out vec4 outColor;

void main() {
  outColor = texture(u_image, v_uv);
}
`,d=`#version 300 es

in vec4 a_position;
in vec2 a_uv;

uniform float u_time;
uniform vec2 u_resolution;

out vec2 v_uv;

void main() {
  vec4 pos = a_position;

  gl_Position = pos;
  v_uv = a_uv;
}
`;(()=>{const s=document.querySelector("#canvas");if(!s)throw new Error("no canvas");const n=s.getContext("webgl2");if(!n)throw new Error("no gl context");const _=({positionAttributeLocation:o,uvAttributeLocation:t})=>{const e=n.createVertexArray();n.bindVertexArray(e);const a=new Float32Array([-1,-1,1,-1,1,1,-1,1]);n.bindBuffer(n.ARRAY_BUFFER,n.createBuffer()),n.bufferData(n.ARRAY_BUFFER,a,n.STATIC_DRAW),n.enableVertexAttribArray(o),n.vertexAttribPointer(o,2,n.FLOAT,!1,0,0);const c=new Float32Array([0,0,1,0,1,1,0,1]);n.bindBuffer(n.ARRAY_BUFFER,n.createBuffer()),n.bufferData(n.ARRAY_BUFFER,c,n.STATIC_DRAW),n.enableVertexAttribArray(t),n.vertexAttribPointer(t,2,n.FLOAT,!1,0,0);const u=new Uint16Array([0,1,3,3,1,2]);return n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,n.createBuffer()),n.bufferData(n.ELEMENT_ARRAY_BUFFER,new Uint16Array(u),n.STATIC_DRAW),n.bindVertexArray(null),n.bindBuffer(n.ARRAY_BUFFER,null),n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,null),e},r=(()=>{const o=v(n,n.VERTEX_SHADER,d),t=v(n,n.FRAGMENT_SHADER,L),e=E(n,o,t),a=n.getAttribLocation(e,"a_position"),c=n.getAttribLocation(e,"a_uv"),u=n.getUniformLocation(e,"u_time"),l=n.getUniformLocation(e,"u_resolution"),A=n.getUniformLocation(e,"u_image");return{vao:_({positionAttributeLocation:a,uvAttributeLocation:c}),program:e,uniforms:{timeLocation:u,resolutionLocation:l,imageLocation:A}}})(),i=(()=>{const o=v(n,n.VERTEX_SHADER,d),t=v(n,n.FRAGMENT_SHADER,p),e=E(n,o,t),a=n.getAttribLocation(e,"a_position"),c=n.getAttribLocation(e,"a_uv"),u=n.getUniformLocation(e,"u_time"),l=n.getUniformLocation(e,"u_resolution"),A=n.getUniformLocation(e,"u_image");return{vao:_({positionAttributeLocation:a,uvAttributeLocation:c}),program:e,uniforms:{timeLocation:u,resolutionLocation:l,imageLocation:A}}})(),f=g(n),m=g(n),R=n.createFramebuffer();n.bindFramebuffer(n.FRAMEBUFFER,R);const T=n.COLOR_ATTACHMENT0;n.framebufferTexture2D(n.FRAMEBUFFER,T,n.TEXTURE_2D,m,0);const F=+new Date;(function o(){const t=(+new Date-F)/1e3;x(n.canvas)&&(n.viewport(0,0,n.canvas.width,n.canvas.height),b(n,m),b(n,f)),n.clearColor(0,0,0,1),n.clear(n.COLOR_BUFFER_BIT),n.bindFramebuffer(n.FRAMEBUFFER,R),n.viewport(0,0,n.canvas.width,n.canvas.height),n.useProgram(i.program),n.uniform1f(i.uniforms.timeLocation,t),n.uniform2fv(i.uniforms.resolutionLocation,[n.canvas.width,n.canvas.height]),n.activeTexture(n.TEXTURE0+0),n.bindTexture(n.TEXTURE_2D,f),n.uniform1i(i.uniforms.imageLocation,0),n.bindVertexArray(i.vao),n.drawElements(n.TRIANGLES,6,n.UNSIGNED_SHORT,0),n.bindVertexArray(null),n.bindTexture(n.TEXTURE_2D,f),n.copyTexImage2D(n.TEXTURE_2D,0,n.RGBA,0,0,s.clientWidth,s.clientHeight,0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.viewport(0,0,n.canvas.width,n.canvas.height),n.useProgram(r.program),n.bindVertexArray(r.vao),n.uniform1f(r.uniforms.timeLocation,t),n.uniform2fv(r.uniforms.resolutionLocation,[n.canvas.width,n.canvas.height]),n.activeTexture(n.TEXTURE0+0),n.bindTexture(n.TEXTURE_2D,m),n.uniform1i(r.uniforms.imageLocation,0),n.drawElements(n.TRIANGLES,6,n.UNSIGNED_SHORT,0),n.bindVertexArray(null),requestAnimationFrame(o)})()})();
