#version 450
layout(set = 0, binding = 0) uniform UBO {
  float iTime;
  float mouse_x;
  float mouse_y;
  float resolution_x;
  float resolution_y;
};
layout(set = 0, binding = 1) uniform sampler baseSampler;
layout(set = 0, binding = 2) uniform texture2D environmentMap;

layout(location = 0) out vec4 outColor;

// --------- END-SHADER-TOY-CODE-HERE ------------

void main() {

  vec2 fragCoord = gl_FragCoord.xy;

  vec2 iResolution = vec2(resolution_x, resolution_y);

  vec2 uv =
      (fragCoord - iResolution.xy * 0.5) / min(iResolution.y, iResolution.x);

  vec4 f_color = texture(sampler2D(environmentMap, baseSampler), uv);

  f_color.xy += uv.xy;

  outColor = f_color;
}
