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

        throw new Error('WebGPU does not work');
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
                code: glslang.compileGLSL(window.SHADERS.vertex, 'vertex'),
            }),
            entryPoint: 'main',
        },
        fragment: {
            module: device.createShaderModule({
                code: glslang.compileGLSL(window.SHADERS.fragment, 'fragment'),
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

    const timeBufferData = new Float32Array([0]);
    const mouseBufferData = new Float32Array([0, 0]);
    const resolutionBufferData = new Float32Array([0, 0]);

    function frame(timestamp) {
        timeBufferData[0] = timestamp / 1000;
        device.queue.writeBuffer(buffer, 0, timeBufferData.buffer, 0, 4);

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

    canvas.addEventListener('mousemove', (e) => {
        const rect = e.target.getBoundingClientRect();
        const [x, y] = [e.clientX - rect.left, e.clientY - rect.top];

        mouseBufferData[0] = x;
        mouseBufferData[1] = y;
        device.queue.writeBuffer(buffer, 4, mouseBufferData.buffer, 0, 8);
    });

    new ResizeObserver(() => {
        const { width, height } = canvas.parentElement.getBoundingClientRect();
        resolutionBufferData[0] = width;
        resolutionBufferData[1] = height;
        device.queue.writeBuffer(buffer, 12, resolutionBufferData.buffer, 0, 8);

        Object.assign(canvas, { width, height });
    }).observe(canvas.parentElement);

    requestAnimationFrame(frame);
})();
