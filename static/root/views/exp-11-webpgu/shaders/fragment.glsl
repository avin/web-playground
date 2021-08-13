#version 450
layout(set = 0, binding = 0) uniform UBO {
  float iTime;
  float mouse_x;
  float mouse_y;
  float resolution_x;
  float resolution_y;
};
layout(set = 0, binding = 1) uniform sampler baseSampler;
layout(set = 0, binding = 2) uniform texture2D environmentMap;

layout(location = 0) out vec4 outColor;

// --------- START-SHADER-TOY-CODE-HERE ------------

// Original one hosted on https://www.shadertoy.com/view/ftsGRS

#define PI 3.1415926
#define PI2 6.2831852

#define SF 1. / min(resolution_x, resolution_y)
#define SS(l, s) smoothstep(SF, -SF, l - s)

#define hue(v) (.6 + .6 * cos(6.3 * (v) + vec4(0, 23, 21, 0)))

#define MOD3 vec3(.1031, .11369, .13787)

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

vec3 hash33(vec3 p3) {
  p3 = fract(p3 * MOD3);
  p3 += dot(p3, p3.yxz + 19.19);
  return -1.0 + 2.0 * fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y,
                                 (p3.y + p3.z) * p3.x));
}

float snoise(vec3 p) {
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

  vec4 h =
      max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
  // eslint-disable-next-line max-len
  vec4 n = h * h * h * h *
           vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)),
                dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));

  return dot(vec4(31.316), n);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 iResolution = vec2(resolution_x, resolution_y);

  vec2 uv =
      (fragCoord - iResolution.xy * 0.5) / min(iResolution.y, iResolution.x);

  float l = length(uv);

  vec3 result = vec3(mouse_x / iResolution.x, mouse_y / iResolution.y, 0.);

  for (float i = 40.; i > 0.; i -= 1.) {

    float a = sin(atan(uv.y, uv.x) + i * .1);
    float am = abs(a - .5) / 4.;

    float zn = .0125 +
               snoise(vec3(a, a, 10. * i * .005 + iTime * 1.25 - i * .11)) * i *
                   .0025 +
               i * .01;
    float d = SS(l, zn);

    float rn = hash11(i);
    vec3 col = hue(rn).rgb;

    result = mix(result, col, d);

    float dd = SS(l, zn) * SS(zn - SF, l);

    result = mix(result, vec3(0.), dd);
  }

  fragColor = vec4(vec3(result), 1.0);
}

// --------- END-SHADER-TOY-CODE-HERE ------------

void main() {

  vec2 iResolution = vec2(resolution_x, resolution_y);
  vec2 uv = (gl_FragCoord.xy - iResolution.xy * 0.5) /
            min(iResolution.y, iResolution.x);

  vec4 f_color = texture(sampler2D(environmentMap, baseSampler), uv);

  mainImage(outColor, gl_FragCoord.xy);

  // outColor = vec4(1., 1., 0., 1.);
  outColor = outColor + f_color;
}
