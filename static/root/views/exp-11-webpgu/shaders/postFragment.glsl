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

#define iChannel0 sampler2D(environmentMap, baseSampler)

// --------- END-SHADER-TOY-CODE-HERE ------------

void main() {

  vec2 iResolution = vec2(resolution_x, resolution_y);
  vec2 uv = gl_FragCoord.xy / iResolution.xy;

  vec3 col = texture(iChannel0, uv).rgb;

  // Desaturate
  if (uv.x < .25) {
    col = vec3((col.r + col.g + col.b) / 3.);
  }
  // Invert
  else if (uv.x < .5) {
    col = vec3(1.) - texture(iChannel0, uv).rgb;
  }
  // Chromatic aberration
  else if (uv.x < .75) {
    vec2 offset = vec2(.01, .0);
    col.r = texture(iChannel0, uv + offset.xy).r;
    col.g = texture(iChannel0, uv).g;
    col.b = texture(iChannel0, uv + offset.yx).b;
  }

  // Color switching
  else {
    col.rgb = texture(iChannel0, uv).brg;
  }

  // Line
  if (mod(abs(uv.x + .5 / iResolution.y), .25) < 1. / iResolution.y)
    col = vec3(1.);

  outColor = vec4(col, 1.);
}
