import"../../modulepreload-polyfill-B5Qt9EMX.js";import{c as p,a as B,r as D}from"../../utils--pvlLDmQ.js";const L=`#version 300 es

precision highp float;

in vec2 v_uv;
in float v_depth;

uniform vec2 u_resolution;

out vec4 outColor;

void main() {
  vec2 ouv = (v_uv - .5);
  vec2 uv = ouv;

  float smoothing = .75 - sqrt(v_depth * 2.5);
  smoothing = clamp(smoothing, 0., .49);

  float d = smoothstep(.5, smoothing, length(uv));

  d -= smoothstep(.5, .0, length(uv)) * .25;
  d -= smoothstep(.5, .4, length(uv)) * .2;
  d *= .5 * (1. - v_depth);
  d = clamp(d, 0., 1.);
  d *= d * 2.5;
  d *= clamp(sqrt(u_resolution.x / u_resolution.y), 0., 1.);

  outColor = vec4(vec3(uv, uv.x+uv.y), d);
}
`,T=`#version 300 es

in vec4 a_position;
in vec2 a_offset;
in vec2 a_uv;

uniform float u_time;
uniform vec2 u_resolution;

out vec2 v_uv;
out float v_depth;

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

void main() {
  vec4 pos = a_position;

  float depth = hash11(float(gl_InstanceID) * .01);
  float size = hash11(float(gl_InstanceID + 147) * .053);
  float speed = hash11(float(gl_InstanceID + 254) * .0425);
  float timeOffset = hash11(float(gl_InstanceID + 557) * .0149);

  pos.xy *= .5 + sqrt(depth) * (size*.75 + .25) * 5.;

  pos.x *= u_resolution.y / u_resolution.x;

  pos = pos + vec4(a_offset, 0., 0.);

  float t = u_time * .25 * (1. - depth + speed * .5) * .8 + 100.;

  float mFactor = t / (1. + sqrt(depth * 2.)) + timeOffset;
  float mFx = hash11(floor(mFactor)*.1)*2. - 1.;
  float yOffset = (fract(mFactor) * 2. - 1.) * 2.;
  pos.y += yOffset;
  pos.x += mFx;

  pos.x += sin(yOffset * 5. * speed) * .02;

  gl_Position = pos;
  v_uv = a_uv;
  v_depth = depth;
}
`;(()=>{const a=new window.Stats;a.showPanel(0),document.body.appendChild(a.dom);const i=document.querySelector("#canvas");if(!i)throw new Error("no canvas");const t=i.getContext("webgl2");if(!t)throw new Error("no gl context");t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA);const m=p(t,t.VERTEX_SHADER,T),R=p(t,t.FRAGMENT_SHADER,L),e=B(t,m,R),f=t.getAttribLocation(e,"a_position"),c=t.getAttribLocation(e,"a_uv"),r=t.getAttribLocation(e,"a_offset"),F=t.getUniformLocation(e,"u_time"),b=t.getUniformLocation(e,"u_resolution"),o=1e4,u=new Float32Array(o*2),E=new Float32Array(o*1),g=new Float32Array(o*3),y=new Float32Array(o*1),l=[],A=[],d=[],v=[];for(let n=0;n<o;n+=1)d.push(new Float32Array(u.buffer,n*2*4,2)),A.push(new Float32Array(E.buffer,n*1*4,1)),l.push(new Float32Array(g.buffer,n*3*4,3)),v.push(new Float32Array(y.buffer,n*1*4,1));d.forEach(n=>{n[0]=Math.random()*2-1,n[1]=Math.random()*2-1}),A.forEach(n=>{n[0]=Math.random()}),l.forEach(n=>{n[0]=Math.random(),n[1]=Math.random(),n[2]=Math.random()}),v.forEach(n=>{n[0]=Math.random()*2+.5});const h=t.createVertexArray();t.bindVertexArray(h);{const s=new Float32Array([-.075,-.075,.075,-.075,.075,.075,-.075,.075]);t.bindBuffer(t.ARRAY_BUFFER,t.createBuffer()),t.bufferData(t.ARRAY_BUFFER,s,t.STATIC_DRAW),t.enableVertexAttribArray(f),t.vertexAttribPointer(f,2,t.FLOAT,!1,0,0);const _=new Float32Array([0,0,1,0,1,1,0,1]);t.bindBuffer(t.ARRAY_BUFFER,t.createBuffer()),t.bufferData(t.ARRAY_BUFFER,_,t.STATIC_DRAW),t.enableVertexAttribArray(c),t.vertexAttribPointer(c,2,t.FLOAT,!1,0,0);const S=new Uint16Array([0,1,3,3,1,2]);t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,t.createBuffer()),t.bufferData(t.ELEMENT_ARRAY_BUFFER,new Uint16Array(S),t.STATIC_DRAW);const x=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,x),t.bufferData(t.ARRAY_BUFFER,u,t.STATIC_DRAW),t.enableVertexAttribArray(r),t.vertexAttribPointer(r,2,t.FLOAT,!1,0,0),t.vertexAttribDivisor(r,1),t.bindVertexArray(null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null)}const w=+new Date;(function n(){a.begin();const s=(+new Date-w)/1e3;D(t.canvas)&&t.viewport(0,0,t.canvas.width,t.canvas.height),t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),t.useProgram(e),t.uniform1f(F,s),t.uniform2fv(b,[t.canvas.width,t.canvas.height]),t.bindVertexArray(h),t.drawElementsInstanced(t.TRIANGLES,6,t.UNSIGNED_SHORT,0,o),t.bindVertexArray(null),a.end(),requestAnimationFrame(n)})()})();
