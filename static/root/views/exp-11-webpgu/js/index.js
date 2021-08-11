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

// Original one hosted on https://www.shadertoy.com/view/ftsGRS

#define PI 3.1415926
#define PI2 6.2831852

#define SF 1./min(iResolution.x,iResolution.y)
#define SS(l,s) smoothstep(SF,-SF,l-s)

#define hue(v)  ( .6 + .6 * cos( 6.3*(v)  + vec4(0,23,21,0)  ) )

#define MOD3 vec3(.1031, .11369, .13787)

float hash11(float p)
{
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

vec3 hash33(vec3 p3)
{
    p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}

float snoise(vec3 p)
{
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
    // eslint-disable-next-line max-len
    vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));

    return dot(vec4(31.316), n);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 iResolution = vec2(1000., 600.);

    vec2 uv = (fragCoord - iResolution.xy * 0.5) / iResolution.y;

    float l = length(uv);

    vec3 result = vec3(0.);

    for(float i=40.; i>0.; i-=1.){

        float a = sin(atan(uv.y, uv.x) + i*.1);
        float am = abs(a-.5)/4.;

        float zn = .0125 + snoise(vec3(a,a, 10.*i*.005 + iTime*1.25-i*.11))*i*.0025 + i*.01;
        float d = SS(l, zn);

        float rn = hash11(i);
        vec3 col = hue(rn).rgb;

        result = mix(result, col, d);

        float dd =  SS(l, zn) * SS(zn-SF, l);

        result = mix(result, vec3(0.), dd);
    }


    fragColor = vec4(vec3(result), 1.0);
}

// --------- END-SHADER-TOY-CODE-HERE ------------

void main() {
    mainImage(outColor, gl_FragCoord.xy);
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
        uniformTime[0] = timestamp / 1000;
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
