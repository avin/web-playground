import"../../modulepreload-polyfill-B5Qt9EMX.js";import{c,a as d,r as m}from"../../utils--pvlLDmQ.js";const v=`#version 300 es

precision highp float;

in vec4 v_color;

out vec4 outColor;

void main() { outColor = v_color; }
`,h=`#version 300 es

in vec4 a_position;
in vec4 a_color;

out vec4 v_color;

// all shaders have a main function
void main() {
  gl_Position = a_position;

  v_color = a_color;
}
`,s=()=>new Uint8Array([Math.random()*256,Math.random()*256,Math.random()*256,255,Math.random()*256,Math.random()*256,Math.random()*256,255,Math.random()*256,Math.random()*256,Math.random()*256,255]),A=document.querySelector("#canvas");if(!A)throw new Error("no canvas");const r=A.getContext("webgl2");if(!r)throw new Error("no gl context");const u=c(r,r.VERTEX_SHADER,h),_=c(r,r.FRAGMENT_SHADER,v),e=d(r,u,_),n=r.getAttribLocation(e,"a_position"),a=r.getAttribLocation(e,"a_color"),l=r.createVertexArray();r.bindVertexArray(l);const f=r.createBuffer();{const t=new Float32Array([-.8,-.8,-.8,.8,.9,.25]);r.bindBuffer(r.ARRAY_BUFFER,r.createBuffer()),r.bufferData(r.ARRAY_BUFFER,t,r.STATIC_DRAW),r.enableVertexAttribArray(n),r.vertexAttribPointer(n,2,r.FLOAT,!1,0,0);const o=s();r.bindBuffer(r.ARRAY_BUFFER,f),r.bufferData(r.ARRAY_BUFFER,o,r.STATIC_DRAW),r.enableVertexAttribArray(a),r.vertexAttribPointer(a,4,r.UNSIGNED_BYTE,!0,0,0)}const b=+new Date;let i;(function t(){const o=(+new Date-b)/1e3;if(Math.floor(o*4)!==Math.floor(i*4)){i=o;const R=s();r.bindBuffer(r.ARRAY_BUFFER,f),r.bufferData(r.ARRAY_BUFFER,R,r.STATIC_DRAW)}m(r.canvas)&&r.viewport(0,0,r.canvas.width,r.canvas.height),r.clearColor(0,0,0,0),r.clear(r.COLOR_BUFFER_BIT),r.useProgram(e),r.bindVertexArray(l),r.drawArrays(r.TRIANGLES,0,3),requestAnimationFrame(t)})();
