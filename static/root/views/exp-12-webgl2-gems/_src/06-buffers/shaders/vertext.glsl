#version 300 es

in vec4 a_position;
in vec2 a_uv;

uniform float u_time;
uniform vec2 u_resolution;

out vec2 v_uv;

void main() {
  vec4 pos = a_position;

  gl_Position = pos;
  v_uv = a_uv;
}
