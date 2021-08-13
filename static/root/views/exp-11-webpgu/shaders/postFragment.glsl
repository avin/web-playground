#version 450
layout(set = 0, binding = 0) uniform UBO {
  float iTime;
  float mouse_x;
  float mouse_y;
  float resolution_x;
  float resolution_y;
};
layout(location = 0) out vec4 outColor;

// --------- END-SHADER-TOY-CODE-HERE ------------

void main() {
    outColor = vec4(1.,0.,0.,1.);
}
