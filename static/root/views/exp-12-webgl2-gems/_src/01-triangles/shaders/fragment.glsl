#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform vec3 triColor;
uniform float time;
uniform float speed;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  vec3 col = triColor;
  col.g = (sin(time * 10. * speed) * .5 + .5);

  outColor = vec4(col, 1);
}
