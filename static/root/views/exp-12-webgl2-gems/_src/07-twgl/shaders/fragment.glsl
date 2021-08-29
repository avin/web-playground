#version 300 es

precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

out vec4 outColor;

#define hue(h) clamp(abs(fract(h + vec4(3, 2, 1, 0) / 3.) * 6. - 3.) - 1., 0., 1.)

float hash12(vec2 p)
{
    vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 cc = floor(gl_FragCoord.xy * (.075 + sin(u_time)*.01) + vec2(u_time*10.)) * 1.1;

  float idx = hash12(cc);
  float idx2 = hash12(cc + 998.551);

  vec3 col = hue(idx + u_time * idx2*2.).rgb;

  outColor = vec4(col, 1.);
}
