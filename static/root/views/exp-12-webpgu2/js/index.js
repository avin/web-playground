(async () => {
    const vertexShaderWgslCode = `
    [[stage(vertex)]]
    fn main([[builtin(vertex_index)]] VertexIndex : u32) -> [[builtin(position)]] vec4<f32> {
      var pos : array<vec2<f32>, 6> = array<vec2<f32>, 6>(
        vec2<f32>(-1., -1.), vec2<f32>(-1., 1.), vec2<f32>(1., 1.),
        vec2<f32>(1., -1.), vec2<f32>(-1., -1.), vec2<f32>(1., 1.)
      );

      return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
    }`;

    const fragmentShaderWgslCode = `
    [[stage(fragment)]]
    fn main([[builtin(position)]] FragCoord : vec4<f32>) -> [[location(0)]] vec4<f32> {
      let iResolution = vec2<f32>(1000., 680.);
      let uv = (2. * FragCoord.xy - iResolution) / iResolution.y * vec2<f32>(1., -1.);

      let d = step(.25, uv.x + uv.y);

      return vec4<f32>(vec3<f32>(d), 1.0);
    }`;

    const canvas = document.getElementById('canvas')
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const context = canvas.getContext('gpupresent');

    if (!context || !navigator.gpu) {
        document.getElementById('error').style.display = 'block';
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    const swapChainFormat = 'bgra8unorm';

    const swapChain = context.configureSwapChain({
        device,
        format: swapChainFormat
    });

    const pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: vertexShaderWgslCode,
            }),
            entryPoint: 'main',
        },
        fragment: {
            module: device.createShaderModule({
                code: fragmentShaderWgslCode,
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

    function frame() {
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
        passEncoder.draw(6, 1, 0, 0);
        passEncoder.endPass();

        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
})();
