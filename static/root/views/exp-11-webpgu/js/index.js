const vertex = `\
  #version 450
  const vec2 pos[6] = vec2[6](
    vec2(-1., -1.), vec2(-1., 1.), vec2(1., 1.),
    vec2(1., -1.), vec2(-1., -1.), vec2(1., 1.)
  );

  void main() {
      gl_Position = vec4(pos[gl_VertexIndex], 0.0, 1.0);
  }
`;

const fragment = `\
  #version 450
  layout(set = 0, binding = 0) uniform UBO {
    float iTime;
    float mouse_x;
    float mouse_y;
    float resolution_x;
    float resolution_y;
  };
  layout(location = 0) out vec4 outColor;

// --------- START-SHADER-TOY-CODE-HERE ------------

#define TAU 6.2831852
#define MOD3 vec3(.1031, .11369, .13787)
#define BLACK_COL vec3(0, 0, 0) / 255.

vec3 hash33(vec3 p3) {
  p3 = fract(p3 * MOD3);
  p3 += dot(p3, p3.yxz + 19.19);
  return -1.0 + 2.0 * fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}

float simplex_noise(vec3 p) {
  const float K1 = 0.333333333;
  const float K2 = 0.166666667;

  vec3 i = floor(p + (p.x + p.y + p.z) * K1);
  vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);

  vec3 e = step(vec3(0.0), d0 - d0.yzx);
  vec3 i1 = e * (1.0 - e.zxy);
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);

  vec3 d1 = d0 - (i1 - 1.0 * K2);
  vec3 d2 = d0 - (i2 - 2.0 * K2);
  vec3 d3 = d0 - (1.0 - 3.0 * K2);

  vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
  vec4 n = h * h * h * h *
           vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));

  return dot(vec4(31.316), n);
}

vec4 mainImage(in vec4 fragColor, in vec2 uv) {

  // float iTime = 0.;

  float a = sin(atan(uv.y, uv.x));
  float am = abs(a - .5) / 4.;
  float l = length(uv * 3.0);

  float m1 = clamp(.1 / smoothstep(.0, 1.75, l), 0., 1.);
  float m2 = clamp(.1 / smoothstep(.42, 0., l), 0., 1.);
  float s1 = (simplex_noise(vec3(uv * 2., 1. + iTime * .525)) * (max(1.0 - l * 1.75, 0.)) + .9);
  float s2 = (simplex_noise(vec3(uv * 5., 15. + iTime * .525)) * (max(.0 + l * 1., .025)) + 1.25);
  float s3 =
      (simplex_noise(vec3(vec2(am, am * 100. + iTime * 3.) * .15, 30. + iTime * .525)) * (max(.0 + l * 1., .25)) + 1.5);
  s3 *= smoothstep(0.0, .3345, l);

  float sh = smoothstep(0.175, .35, l);

  float m = m1 * m1 * m2 * ((s1 * s2 * s3) * (1.0 - l)) * sh;
  // m = smoothstep(0., 1.91, m);

  vec3 col = mix(vec3(0.), (0.5 + 0.5 * cos(iTime + uv.xyx * 3. + vec3(0, 2, 4))), m * m);

  return vec4(vec3(m * (m / 1.5)), 1.);
}

// --------- END-SHADER-TOY-CODE-HERE ------------

void main() {

    vec2 iResolution = vec2(1000., 600.);
    vec2 uv = (gl_FragCoord.xy - iResolution*.5) / iResolution.y;

    outColor = mainImage(gl_FragCoord, uv*.5);

}
`;

(async () => {
    const glslangModule = await import('https://unpkg.com/@webgpu/glslang@0.0.15/dist/web-devel/glslang.js');
    const glslang = await glslangModule.default();

    // const vertexShaderWgslCode = `
    // [[stage(vertex)]]
    // fn main([[builtin(vertex_index)]] VertexIndex : u32) -> [[builtin(position)]] vec4<f32> {
    //   var pos : array<vec2<f32>, 6> = array<vec2<f32>, 6>(
    //     vec2<f32>(-1., -1.), vec2<f32>(-1., 1.), vec2<f32>(1., 1.),
    //     vec2<f32>(1., -1.), vec2<f32>(-1., -1.), vec2<f32>(1., 1.)
    //   );
    //
    //   return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
    // }`;
    //
    // const fragmentShaderWgslCode = `
    // [[stage(fragment)]]
    // fn main([[builtin(position)]] FragCoord : vec4<f32>) -> [[location(0)]] vec4<f32> {
    //   let iResolution = vec2<f32>(1000., 680.);
    //   let uv = (2. * FragCoord.xy - iResolution) / iResolution.y * vec2<f32>(1., -1.);
    //   return vec4<f32>(uv, 1.0, 1.0);
    // }`;

    const canvas = document.getElementById('canvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const context = canvas.getContext('webgpu');

    if (!context || !navigator.gpu) {
        document.getElementById('error').style.display = 'block';
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    const swapChainFormat = 'bgra8unorm';

    const swapChain = context.configureSwapChain({
        device,
        format: swapChainFormat,
    });

    // ------------

    const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {
                    type: 'uniform',
                    minBindingSize: 20,
                },
            },
        ],
    });

    const buffer = device.createBuffer({
        size: Float32Array.BYTES_PER_ELEMENT * 5,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: { buffer },
            },
        ],
    });

    // ------------

    const pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        }),
        vertex: {
            module: device.createShaderModule({
                // code: vertexShaderWgslCode,
                code: glslang.compileGLSL(vertex, 'vertex'),
            }),
            entryPoint: 'main',
        },
        fragment: {
            module: device.createShaderModule({
                // code: fragmentShaderWgslCode,
                code: glslang.compileGLSL(fragment, 'fragment'),
            }),
            entryPoint: 'main',
            targets: [
                {
                    format: swapChainFormat,
                },
            ],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });

    const uniformTime = new Float32Array([0]);

    function frame(timestamp) {

        // console.log(a);

        // bufferSubData(
        //     device,
        //     buffer,
        //     Float32Array.BYTES_PER_ELEMENT * 0,
        //     new Float32Array([timestamp / 1000])
        // );

        uniformTime[0] = (timestamp) / 1000;
        device.queue.writeBuffer(buffer, 0, uniformTime.buffer);

        const commandEncoder = device.createCommandEncoder();
        const textureView = swapChain.getCurrentTexture().createView();

        const renderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    storeOp: 'store',
                },
            ],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(6, 1, 0, 0);
        passEncoder.endPass();

        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
})();
