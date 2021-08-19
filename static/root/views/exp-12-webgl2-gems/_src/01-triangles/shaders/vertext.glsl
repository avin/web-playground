#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;

uniform float time;
uniform float speed;

void rotate(in float angle, inout vec2 uv) {
  float ca = cos(angle);
  float sa = sin(angle);
  uv *= mat2(ca, -sa, sa, ca);
}

// all shaders have a main function
void main() {

  vec2 pos = a_position.xy;

  rotate(time * speed, pos);

  gl_Position = vec4(pos, 0., 1.);
}
