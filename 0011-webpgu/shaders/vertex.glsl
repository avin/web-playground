#version 450
layout(location = 0) out vec2 vUV;
const vec2 pos[6] = vec2[6](vec2(-1., -1.), vec2(-1., 1.), vec2(1., 1.),
                            vec2(1., -1.), vec2(-1., -1.), vec2(1., 1.));

void main() {

  vec2[6] pos = vec2[6](
      vec2( 1.0,  1.0),
      vec2( 1.0, -1.0),
      vec2(-1.0, -1.0),
      vec2( 1.0,  1.0),
      vec2(-1.0, -1.0),
      vec2(-1.0,  1.0));

  vec2[6] uv = vec2[6](
      vec2(1.0, 0.0),
      vec2(1.0, 1.0),
      vec2(0.0, 1.0),
      vec2(1.0, 0.0),
      vec2(0.0, 1.0),
      vec2(0.0, 0.0));


gl_Position = vec4(pos[gl_VertexIndex], 0.0, 1.0);
vUV = uv[gl_VertexIndex];

}
