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

layout(location = 0) in vec2 vUV;
layout(location = 0) out vec4 outColor;

#define iChannel0 sampler2D(environmentMap, baseSampler)

// --------- END-SHADER-TOY-CODE-HERE ------------

#define DISPLAY_GAMMA 1.5

#define GOLDEN_ANGLE 2.39996323
#define MAX_BLUR_SIZE 20.0

// Smaller = nicer blur, larger = faster
#define RAD_SCALE 0.5

#define uFar 100.0

vec4 readTexture(vec2 coord){
    return texture(iChannel0, coord).rgba;
}

float getBlurSize(float depth, float focusPoint, float focusScale) {
  float coc = clamp((1.0 / focusPoint - 1.0 / depth) * focusScale, -1.0, 1.0);
  return abs(coc) * MAX_BLUR_SIZE;
}

vec3 depthOfField(vec2 texCoord, float focusPoint, float focusScale) {
  vec2 iResolution = vec2(resolution_x, resolution_y);

  vec4 Input = readTexture(texCoord);
  float centerDepth = Input.a * uFar;
  float centerSize = getBlurSize(centerDepth, focusPoint, focusScale);
  vec3 color = Input.rgb;
  float tot = 1.0;

  vec2 texelSize = 1.0 / iResolution.xy;

  float radius = RAD_SCALE;
  for (float ang = 0.0; radius < MAX_BLUR_SIZE; ang += GOLDEN_ANGLE) {
    vec2 tc = texCoord + vec2(cos(ang), sin(ang)) * texelSize * radius;

    vec4 sampleInput = readTexture(tc);

    vec3 sampleColor = sampleInput.rgb;
    float sampleDepth = sampleInput.a * uFar;
    float sampleSize = getBlurSize(sampleDepth, focusPoint, focusScale);

    if (sampleDepth > centerDepth) {
      sampleSize = clamp(sampleSize, 0.0, centerSize * 2.0);
    }

    float m = smoothstep(radius - 0.5, radius + 0.5, sampleSize);
    color += mix(color / tot, sampleColor, m);
    tot += 1.0;
    radius += RAD_SCALE / radius;
  }

  return color /= tot;
}

void main() {

  vec2 iResolution = vec2(resolution_x, resolution_y);
  // vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = vUV;

  vec4 color;

  float focusPoint = 88.0;
  float focusScale = iResolution.y / 15.;

  color.rgb = depthOfField(uv, focusPoint, focusScale);

  // tone mapping
  color.rgb = vec3(1.7, 1.8, 1.9) * color.rgb / (1.0 + color.rgb);

  vec3 col = color.rgb;

  //-----------------------------------------------------
  // postprocessing
  //-----------------------------------------------------

  // Color control
  col = 0.5 * col + 0.5 * col * col * (3.0 - 2.0 * col);

  // Border dark
  col *= 0.2 + 0.8 * pow(32.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.3);

  // Fade in
  col *= smoothstep(0.0, 1.0, iTime);

  // inverse gamma correction
  outColor = vec4(pow(col, vec3(1.0 / DISPLAY_GAMMA)), 1.0);
}
