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

//
// Inspired by blog post: http://tuxedolabs.blogspot.fr/2018/05/bokeh-depth-of-field-in-single-pass.html
// Original scene: https://www.shadertoy.com/view/MsG3Dz
//
// There is still lots of flickering, I'm guessing this is because of the original scene's lighting.
// Using PBR would probably fix the crazy specular values we get sometimes
// As a quick way to remove flickering, we can use AA
//


#define DISPLAY_GAMMA 1.5

#define GOLDEN_ANGLE 2.39996323
#define MAX_BLUR_SIZE 20.0

// Smaller = nicer blur, larger = faster
#define RAD_SCALE 0.5

#define uFar 10.0

float getBlurSize(float depth, float focusPoint, float focusScale)
{
	float coc = clamp((1.0 / focusPoint - 1.0 / depth)*focusScale, -1.0, 1.0);
    return abs(coc) * MAX_BLUR_SIZE;
}

vec3 depthOfField(vec2 texCoord, float focusPoint, float focusScale)
{
    vec2 iResolution = vec2(resolution_x, resolution_y);

    vec4 Input = texture(iChannel0, texCoord).rgba;
    float centerDepth = Input.a * uFar;
    float centerSize = getBlurSize(centerDepth, focusPoint, focusScale);
    vec3 color = Input.rgb;
    float tot = 1.0;

    vec2 texelSize = 1.0 / iResolution.xy;

    float radius = RAD_SCALE;
    for (float ang = 0.0; radius < MAX_BLUR_SIZE; ang += GOLDEN_ANGLE)
    {
        vec2 tc = texCoord + vec2(cos(ang), sin(ang)) * texelSize * radius;

        vec4 sampleInput = texture(iChannel0, tc).rgba;

        vec3 sampleColor = sampleInput.rgb;
        float sampleDepth = sampleInput.a * uFar;
        float sampleSize = getBlurSize(sampleDepth, focusPoint, focusScale);

        if (sampleDepth > centerDepth)
        {
        	sampleSize = clamp(sampleSize, 0.0, centerSize*2.0);
        }

        float m = smoothstep(radius-0.5, radius+0.5, sampleSize);
        color += mix(color/tot, sampleColor, m);
        tot += 1.0;
        radius += RAD_SCALE/radius;
    }

    return color /= tot;
}

void main() {

  vec2 iResolution = vec2(resolution_x, resolution_y);
  vec2 uv = gl_FragCoord.xy / iResolution.xy;

//  vec3 col = texture(iChannel0, uv).rgb;
//
//  // Desaturate
//  if (uv.x < .25) {
//    col = vec3((col.r + col.g + col.b) / 3.);
//  }
//  // Invert
//  else if (uv.x < .5) {
//    col = vec3(1.) - texture(iChannel0, uv).rgb;
//  }
//  // Chromatic aberration
//  else if (uv.x < .75) {
//    vec2 offset = vec2(.01, .0);
//    col.r = texture(iChannel0, uv + offset.xy).r;
//    col.g = texture(iChannel0, uv).g;
//    col.b = texture(iChannel0, uv + offset.yx).b;
//  }
//
//  // Color switching
//  else {
//    col.rgb = texture(iChannel0, uv).brg;
//  }
//
//  // Line
//  if (mod(abs(uv.x + .5 / iResolution.y), .25) < 1. / iResolution.y)
//    col = vec3(1.);

    vec4 color = texture(iChannel0, uv).rgba;

    float focusPoint = 88.0;
    float focusScale = iResolution.y/15.;

    color.rgb = depthOfField(uv, focusPoint, focusScale);

    //tone mapping
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

    color.rgb = col;

    // -----------------------------------------------------

    //inverse gamma correction
	outColor = vec4(pow(color.rgb, vec3(1.0 / DISPLAY_GAMMA)), 1.0);

    // Debug depth
    //fragColor.rgb = vec3(color.a)*0.015;

  // outColor = vec4(col, 1.);
}
