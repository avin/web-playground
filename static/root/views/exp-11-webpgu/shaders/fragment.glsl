#version 450
layout(set = 0, binding = 0) uniform UBO {
  float iTime;
  float mouse_x;
  float mouse_y;
  float mouse_z;
  float resolution_x;
  float resolution_y;
};
layout(location = 0) in vec2 vUV;
layout(location = 0) out vec4 outColor;

// --------- START-SHADER-TOY-CODE-HERE ------------

#define ROAD_COL vec3(.1, .1, .1)
#define ROAD_SEP_COL vec3(1., 1., 1.)
#define BUILDING_COL vec3(1., 0., 0.)
#define GROUND_COL vec3(0.250, .250, 0.250)

const float tau = 6.283185;

//------------------------------

float v31(vec3 a) { return a.x + a.y * 37.0 + a.z * 521.0; }
float v21(vec2 a) { return a.x + a.y * 37.0; }
float Hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 33758.5453) - .5;
}
float Hash11(float a) { return fract(sin(a) * 10403.9); }
float Hash21(vec2 uv) {
  float f = uv.x + uv.y * 37.0;
  return fract(sin(f) * 104003.9);
}
vec2 Hash22(vec2 uv) {
  float f = uv.x + uv.y * 37.0;
  return fract(cos(f) * vec2(10003.579, 37049.7));
}
vec2 Hash12(float f) { return fract(cos(f) * vec2(10003.579, 37049.7)); }
float Hash1d(float u) {
  return fract(sin(u) * 143.9); // scale this down to kill the jitters
}
float Hash2d(vec2 uv) {
  float f = uv.x + uv.y * 37.0;
  return fract(sin(f) * 104003.9);
}
float Hash3d(vec3 uv) {
  float f = uv.x + uv.y * 37.0 + uv.z * 521.0;
  return fract(sin(f) * 110003.9);
}
float mixP(float f0, float f1, float a) {
  return mix(f0, f1, a * a * (3.0 - 2.0 * a));
}
const vec2 zeroOne = vec2(0.0, 1.0);
float noise2d(vec2 uv) {
  vec2 fr = fract(uv.xy);
  vec2 fl = floor(uv.xy);
  float h00 = Hash2d(fl);
  float h10 = Hash2d(fl + zeroOne.yx);
  float h01 = Hash2d(fl + zeroOne);
  float h11 = Hash2d(fl + zeroOne.yy);
  return mixP(mixP(h00, h10, fr.x), mixP(h01, h11, fr.x), fr.y);
}
float noise(vec3 uv) {
  vec3 fr = fract(uv.xyz);
  vec3 fl = floor(uv.xyz);
  float h000 = Hash3d(fl);
  float h100 = Hash3d(fl + zeroOne.yxx);
  float h010 = Hash3d(fl + zeroOne.xyx);
  float h110 = Hash3d(fl + zeroOne.yyx);
  float h001 = Hash3d(fl + zeroOne.xxy);
  float h101 = Hash3d(fl + zeroOne.yxy);
  float h011 = Hash3d(fl + zeroOne.xyy);
  float h111 = Hash3d(fl + zeroOne.yyy);
  return mixP(mixP(mixP(h000, h100, fr.x), mixP(h010, h110, fr.x), fr.y),
              mixP(mixP(h001, h101, fr.x), mixP(h011, h111, fr.x), fr.y), fr.z);
}

const float PI = 3.14159265;

vec3 saturate(vec3 a) { return clamp(a, 0.0, 1.0); }
vec2 saturate(vec2 a) { return clamp(a, 0.0, 1.0); }
float saturate(float a) { return clamp(a, 0.0, 1.0); }

//------------------------------

// vec3 opRep(vec3 p, vec3 c) {
//    return mod(p,c)-0.5*c;
// }

vec3 opRep(vec3 p, vec3 c) {
  vec3 res = p;

  if (c.x != 0.)
    res.x = mod(p.x, c.x) - 0.5 * c.x;
  if (c.y != 0.)
    res.y = mod(p.y, c.y) - 0.5 * c.y;
  if (c.z != 0.)
    res.z = mod(p.z, c.z) - 0.5 * c.z;

  return res;
}

vec4 opU(vec4 d1, vec4 d2) { return d1.a < d2.a ? d1 : d2; }

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

mat2 rotation(float theta) {
  return mat2(cos(theta), -sin(theta), sin(theta), cos(theta));
}

vec3 getBuildingColor(vec3 p) {
  vec3 block = floor(p.xyz + vec3(.25, 0., 0.));
  float fill = smoothstep(.1, .9, fract(p.y * 1.)) * step(.1, fract(p.z * 1.)) *
               step(.1, fract(p.x * 2. + 0.5));

  float lightForce = Hash3d(block);
  float isLightning = step(.5, Hash3d(block + vec3(52.12, 17.3, 7.5)));

  return vec3(fill) * (Hash3d(block) * isLightning + .01);
}

vec3 getRoadColor(vec3 p) {
  float lineFill = step(fract(p.x * .25) + .05, .1) * step(.5, fract(p.z * .2));
  float texture = step(fract(p.x * .25) + .05, .1) * step(.5, fract(p.z * .2));

  vec3 roadColor = vec3(noise2d(p.xz * 4.));

  return mix(vec3(0.1, 0.1, 0.11) + roadColor * .05, vec3(1.), lineFill);
}

vec4 map(vec3 p) {

  vec4 res = vec4(getBuildingColor(p),
                  sdBox(opRep(p, vec3(15.0, 0.0, 15.0)), vec3(3.0, 15., 3.0)));
  res = opU(res, vec4(getRoadColor(p), sdBox(opRep(p, vec3(0.0, 0.0, 1.0)),
                                             vec3(3.0, .25, 5.0))));

  // vec3 lp = p + (p.x > 0. ? vec3(0., 0., 2.5) : vec3(0.));
  vec3 lp = p;
  lp = lp + (abs(lp.x) > 10. ? vec3(0., -100., 0.) : vec3(0.));
  float lh = 0.5;
  res = opU(res, vec4(vec3(1., 0., 0.),
                      sdBox(opRep(lp + vec3(0., -lh, 0.), vec3(7.5, 0.0, 5.0)),
                            vec3(.05, .20, .05))));
  res = opU(res, vec4(vec3(0.5, .5, .5), sdBox(opRep(lp, vec3(7.5, 0.0, 5.0)),
                                               vec3(.05, lh, .05))));

  res = opU(res, vec4(GROUND_COL, p.y));

  return res;
}

vec4 trace(vec3 o, vec3 r) {
  float t = 0.0;
  vec3 col = vec3(0.);
  for (int i = 0; i < 100; i++) {
    vec3 p = o + r * t;
    vec4 result = map(p);
    float d = result.a;

    if (d < 0.001)
      break;

    col = result.rgb;
    t += d;
  }
  return vec4(col, t);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 iResolution = vec2(resolution_x, resolution_y);
  vec3 iMouse = vec3(mouse_x, mouse_y, mouse_z);

  vec2 uv = vUV;
  uv.y = 1. - uv.y;

  vec2 m = vec2(0.00, 0.);
  if (iMouse.z > 0.0) {
    m = iMouse.xy / iResolution.xy - vec2(.5, 0.);
  }

  m *= tau * vec2(1.0, 0.25);

  uv = uv * 2.0 - 1.0;
  uv.x *= iResolution.x / iResolution.y;

  float time = iTime * .525 * 1.1 * 1.;
  time = mod(time, 100.);

  vec3 r = normalize(vec3(uv, .75));

  r.yz *= rotation(0.15 - m.y);
  r.xy *= rotation(sin(time + 10.0) * 0.5);

  r.xz *= rotation(-m.x);

  float altitude = sin(time * 0.5) * 0.5 + 2.5;
  vec3 o = vec3(sin(time * 0.5) * 1.17, altitude * .5 + 1., time * 32.0);

  vec4 t = trace(o, r);
  float tDepth = t.a;
  vec3 tCol = t.xyz;
  float fog = 1.0 / (1.0 + tDepth * tDepth * 0.01);
  vec3 col = mix(vec3(0.0), tCol, fog);
  // vec3 fc = vec3(fog);

//  // gamma
//  col = pow(clamp(col, .0, 1.0), vec3(0.95));
//
//  // vignetting
//  vec2 q = fragCoord.xy / iResolution.xy;
//  col *= 0.5 + 0.5 * pow(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.21);

  // fragColor = vec4(vec3(col.r, col.g, fog), 1.);
  // fragColor = vec4(vec3(col.r, col.g, fog), 1.);
  fragColor = vec4(col, fog);
}

// --------- END-SHADER-TOY-CODE-HERE ------------

void main() { mainImage(outColor, gl_FragCoord.xy); }
