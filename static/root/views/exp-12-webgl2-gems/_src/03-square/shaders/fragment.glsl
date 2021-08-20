#version 300 es

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
