import"../../modulepreload-polyfill-B5Qt9EMX.js";import{c as m,a as x,r as T}from"../../utils--pvlLDmQ.js";const U=`#version 300 es

precision highp float;

in vec3 v_color;

out vec4 outColor;

void main() { outColor = vec4(v_color, .5); }
`,C=`#version 300 es

in vec4 a_position;
in vec2 a_offset;
in float a_rotation;
in vec3 a_color;
in float a_speed;

uniform float u_time;
uniform vec2 u_resolution;

out vec3 v_color;

void rotate(in float angle, inout vec2 uv) {
  float ca = cos(angle);
  float sa = sin(angle);
  uv *= mat2(ca, -sa, sa, ca);
}

void main() {
  vec4 pos = a_position;

  // rotate(a_rotation + u_time * a_speed, pos.xy);
  rotate(u_time * a_speed + float(gl_InstanceID), pos.xy);
  pos.x *= u_resolution.y / u_resolution.x;

  pos = pos + vec4(a_offset, 0., 0.);
  gl_Position = pos;
  v_color = a_color;
}
`;(()=>{const r=new window.Stats;r.showPanel(0),document.body.appendChild(r.dom);const f=document.querySelector("#canvas");if(!f)throw new Error("no canvas");const e=f.getContext("webgl2");if(!e)throw new Error("no gl context");e.enable(e.BLEND),e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);const p=m(e,e.VERTEX_SHADER,C),h=m(e,e.FRAGMENT_SHADER,U),o=x(e,p,h),A=e.getAttribLocation(o,"a_position"),a=e.getAttribLocation(o,"a_offset"),i=e.getAttribLocation(o,"a_color"),s=e.getAttribLocation(o,"a_speed"),B=e.getUniformLocation(o,"u_time"),S=e.getUniformLocation(o,"u_resolution"),n=5e3,l=new Float32Array(n*2),g=new Float32Array(n*1),u=new Float32Array(n*3),_=new Float32Array(n*1),R=[],d=[],b=[],v=[];for(let t=0;t<n;t+=1)b.push(new Float32Array(l.buffer,t*2*4,2)),d.push(new Float32Array(g.buffer,t*1*4,1)),R.push(new Float32Array(u.buffer,t*3*4,3)),v.push(new Float32Array(_.buffer,t*1*4,1));b.forEach(t=>{t[0]=Math.random()*2-1,t[1]=Math.random()*2-1}),d.forEach(t=>{t[0]=Math.random()}),R.forEach(t=>{t[0]=Math.random(),t[1]=Math.random(),t[2]=Math.random()}),v.forEach(t=>{t[0]=Math.random()*2+.5});const F=e.createVertexArray();e.bindVertexArray(F);{const c=new Float32Array([-.025,-.025,.025,-.025,.025,.025,-.025,.025]);e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,c,e.STATIC_DRAW),e.enableVertexAttribArray(A),e.vertexAttribPointer(A,2,e.FLOAT,!1,0,0);const E=new Uint16Array([0,1,3,3,1,2]);e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(E),e.STATIC_DRAW);const y=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,y),e.bufferData(e.ARRAY_BUFFER,l,e.STATIC_DRAW),e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0),e.vertexAttribDivisor(a,1);const D=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,D),e.bufferData(e.ARRAY_BUFFER,u,e.STATIC_DRAW),e.enableVertexAttribArray(i),e.vertexAttribPointer(i,3,e.FLOAT,!1,0,0),e.vertexAttribDivisor(i,1);const L=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,L),e.bufferData(e.ARRAY_BUFFER,_,e.STATIC_DRAW),e.enableVertexAttribArray(s),e.vertexAttribPointer(s,1,e.FLOAT,!1,0,0),e.vertexAttribDivisor(s,1),e.bindVertexArray(null),e.bindBuffer(e.ARRAY_BUFFER,null),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,null)}const w=+new Date;(function t(){r.begin();const c=(+new Date-w)/1e3;T(e.canvas)&&e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(1,1,1,1),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(o),e.uniform1f(B,c),e.uniform2fv(S,[e.canvas.width,e.canvas.height]),e.bindVertexArray(F),e.drawElementsInstanced(e.TRIANGLES,6,e.UNSIGNED_SHORT,0,n),e.bindVertexArray(null),r.end(),requestAnimationFrame(t)})()})();
