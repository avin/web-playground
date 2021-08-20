#version 300 es

precision highp float;

uniform sampler2D u_image;
uniform float u_time;

in vec2 v_texCoord;

out vec4 outColor;

void main() {
  float t = u_time * 10.;

  float offsetFactor = t + v_texCoord.y * 10.;
  vec3 col = texture(u_image, v_texCoord).rgb;

  bool isHair = !((abs(col.r - col.g) < .25) && (abs(col.g - col.b) < .25));
  if(isHair){
    col.r = texture(u_image, v_texCoord + vec2(sin(offsetFactor) * .01, 0.)).r;
    col.g = texture(u_image, v_texCoord - vec2(cos(offsetFactor) * .01, 0.)).g;
  }


  outColor = vec4(col, 1.);
}
