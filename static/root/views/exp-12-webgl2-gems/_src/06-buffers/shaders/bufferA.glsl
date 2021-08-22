#version 300 es

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
