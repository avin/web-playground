#version 300 es

in vec4 a_position;
in vec2 a_offset;
in float a_rotation;
in vec3 a_color;
in float a_speed;

uniform float u_time;
uniform vec2 u_resolution;

out vec3 v_color;

void rotate(in float angle, inout vec2 uv) {
  float ca = cos(angle);
  float sa = sin(angle);
  uv *= mat2(ca, -sa, sa, ca);
}

void main() {
  vec4 pos = a_position;

  // rotate(a_rotation + u_time * a_speed, pos.xy);
  rotate(u_time * a_speed + float(gl_InstanceID), pos.xy);
  pos.x *= u_resolution.y / u_resolution.x;

  pos = pos + vec4(a_offset, 0., 0.);
  gl_Position = pos;
  v_color = a_color;
}
