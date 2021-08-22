#version 300 es

in vec4 a_position;
in vec2 a_texCoord;

uniform vec2 u_resolution;

out vec2 v_texCoord;

void main() {
  vec4 pos = a_position;
  pos.x *= u_resolution.y / u_resolution.x;

  gl_Position = pos;
  v_texCoord = a_texCoord;
}
