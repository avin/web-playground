import"../../modulepreload-polyfill-B5Qt9EMX.js";const et=`precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec3 backColor;
uniform float count;

varying float vIdx;
varying float vUseColor;

#define DYNAMIC_COLOR 1
#define hue(h) clamp(abs(fract(h + vec4(3, 2, 1, 0) / 3.) * 6. - 3.) - 1., 0., 1.)

void main() {
  vec3 baseColor = backColor;

  if (vUseColor > .5) {
    float hueFactor = vIdx / count;
    if (DYNAMIC_COLOR == 1) {
      hueFactor += iTime * .1;
    }
    vec3 col = hue(hueFactor).rgb;
    baseColor.rgb = col;
  }

  gl_FragColor = vec4(baseColor, 1.);
}
`,ot=`precision highp float;

attribute vec2 a_position;
attribute float a_idx;
attribute float a_useColor;
attribute float a_offset;

uniform float count;
uniform float iTime;
uniform vec2 iResolution;
uniform float sizeFactor;

varying float vIdx;
varying float vUseColor;

#define MOD3 vec3(.1031, .11369, .13787)

vec3 hash33(vec3 p3) {
  p3 = fract(p3 * MOD3);
  p3 += dot(p3, p3.yxz + 19.19);
  return -1.0 + 2.0 * fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}

float noise(vec3 p) {
  const float K1 = 0.333333333;
  const float K2 = 0.166666667;

  vec3 i = floor(p + (p.x + p.y + p.z) * K1);
  vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);

  vec3 e = step(vec3(0.0), d0 - d0.yzx);
  vec3 i1 = e * (1.0 - e.zxy);
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);

  vec3 d1 = d0 - (i1 - 1.0 * K2);
  vec3 d2 = d0 - (i2 - 2.0 * K2);
  vec3 d3 = d0 - (1.0 - 3.0 * K2);

  vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
  vec4 n = h * h * h * h *
           vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));

  return dot(vec4(31.316), n);
}

void main(void) {
  vec3 positionUpdated = vec3(a_position, a_idx / (count * 3.));

  positionUpdated.x *= 2.;

  float idx = a_idx - count / 2.;

  vIdx = idx;
  vUseColor = a_useColor;

  float t = iTime * .5;

  float xFactor = positionUpdated.x;
  float moveFactor = noise(vec3(xFactor * sizeFactor, idx * .15 - t, 1.)) * .25;

  moveFactor *= step(.5, positionUpdated.y);

  positionUpdated.y += moveFactor;

  positionUpdated.y -= a_offset + .5;

  gl_Position = vec4(positionUpdated, 1.0);
}
`,nt=.03,it=700,rt=20,at=.012,ct=.01,m=[23/255,32/255,38/255],st=0,ft=200,A=document.querySelector("#canvas"),t=A.getContext("webgl")||A.getContext("experimental-webgl"),u=window.devicePixelRatio||1,p=t.getExtension("ANGLE_instanced_arrays");if(!p)throw new Error("no instances");const dt=e=>{const n=e.clientWidth,d=e.clientHeight;(e.width!==n||e.height!==d)&&(e.width=n*u,e.height=d*u,t.viewport(0,0,t.canvas.width,t.canvas.height))},lt=(e=1,n=1,d=1,V=1)=>{const i=d,l=V,E=(i+1)*(l+1),g=i*l*6,F=new Float32Array(E*3),x=new Float32Array(E*3),C=new Float32Array(E*2),s=g>65536?new Uint32Array(g):new Uint16Array(g);let y=0,w=1,I=2,k=1,q=-1,r=0,f=0,Z=0;const _=r,$=e/i,X=n/l;for(let a=0;a<=l;a++){let j=a*X-n/2;for(let c=0;c<=i;c++,r++){let J=c*$-e/2;if(F[r*3+y]=J*k,F[r*3+w]=j*q,F[r*3+I]=Z/2,x[r*3+y]=0,x[r*3+w]=0,x[r*3+I]=1,C[r*2]=c/i,C[r*2+1]=1-a/l,a===l||c===i)continue;let Q=_+c+a*(i+1),D=_+c+(a+1)*(i+1),tt=_+c+(a+1)*(i+1)+1,O=_+c+a*(i+1)+1;s[f*6]=Q,s[f*6+1]=D,s[f*6+2]=O,s[f*6+3]=D,s[f*6+4]=tt,s[f*6+5]=O,f++}}return{position:{size:3,data:F},normal:{size:3,data:x},uv:{size:2,data:C},index:{data:s}}},S=lt(1,1,ft,1),R=rt,N=[],z=[],L=[];let b=0;for(let e=0;e<R*3;e+=1)for(let n=0;n<3;n+=1){const d=n===1?at:ct;N[b]=e-R/2,z[b]=n===1?1:0,L[b]=n*d+(e-R/2)*nt-st,b+=1}console.log(L);const v=t.createShader(t.VERTEX_SHADER);t.shaderSource(v,ot);t.compileShader(v);if(!t.getShaderParameter(v,t.COMPILE_STATUS))throw new Error(`could not compile shader: ${t.getShaderInfoLog(v)||""}`);const h=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(h,et);t.compileShader(h);if(!t.getShaderParameter(h,t.COMPILE_STATUS))throw new Error(`could not compile shader: ${t.getShaderInfoLog(h)||""}`);const o=t.createProgram();t.attachShader(o,v);t.attachShader(o,h);t.linkProgram(o);t.useProgram(o);const Y=t.getAttribLocation(o,"a_position"),U=t.getAttribLocation(o,"a_idx"),B=t.getAttribLocation(o,"a_useColor"),T=t.getAttribLocation(o,"a_offset"),At=t.getUniformLocation(o,"iTime"),ut=t.getUniformLocation(o,"iResolution"),Rt=t.getUniformLocation(o,"sizeFactor"),vt=t.getUniformLocation(o,"count"),ht=t.getUniformLocation(o,"backColor"),P=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,P);t.bufferData(t.ARRAY_BUFFER,S.position.data,t.STATIC_DRAW);const M=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,M);t.bufferData(t.ARRAY_BUFFER,new Float32Array(N),t.STATIC_DRAW);const W=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,W);t.bufferData(t.ARRAY_BUFFER,new Float32Array(z),t.STATIC_DRAW);const G=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,G);t.bufferData(t.ARRAY_BUFFER,new Float32Array(L),t.STATIC_DRAW);const H=t.createBuffer();t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,H);t.bufferData(t.ELEMENT_ARRAY_BUFFER,S.index.data,t.STATIC_DRAW);t.bindBuffer(t.ARRAY_BUFFER,P);t.enableVertexAttribArray(Y);t.vertexAttribPointer(Y,3,t.FLOAT,!1,0,0);t.bindBuffer(t.ARRAY_BUFFER,M);t.enableVertexAttribArray(U);t.vertexAttribPointer(U,1,t.FLOAT,!1,0,0);p.vertexAttribDivisorANGLE(U,1);t.bindBuffer(t.ARRAY_BUFFER,W);t.enableVertexAttribArray(B);t.vertexAttribPointer(B,1,t.FLOAT,!1,0,0);p.vertexAttribDivisorANGLE(B,1);t.bindBuffer(t.ARRAY_BUFFER,G);t.enableVertexAttribArray(T);t.vertexAttribPointer(T,1,t.FLOAT,!1,0,0);p.vertexAttribDivisorANGLE(T,1);function K(e){dt(A),t.clearColor(m[0],m[1],m[2],1),t.clear(t.COLOR_BUFFER_BIT),t.uniform1f(At,e/1e3),t.uniform1f(Rt,A.clientWidth*u/it),t.uniform1f(vt,R),t.uniform3fv(ht,m),t.uniform2f(ut,A.clientWidth*u,A.clientHeight*u),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,H),p.drawElementsInstancedANGLE(t.TRIANGLES,S.index.data.length,t.UNSIGNED_SHORT,0,R*3),window.requestAnimationFrame(K)}K();
