(async () => {
    const glslangModule = await import('https://unpkg.com/@webgpu/glslang@0.0.15/dist/web-devel/glslang.js');
    const glslang = await glslangModule.default();

    const canvas = document.getElementById('canvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const context = canvas.getContext('gpupresent');

    if (!context || !navigator.gpu) {
        throw new Error('WebGPU does not work');
    }

    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    const devicePixelRatio = window.devicePixelRatio || 1;
    const presentationSize = [canvas.clientWidth * devicePixelRatio, canvas.clientHeight * devicePixelRatio];
    // const presentationFormat = context.getPreferredFormat(adapter);
    const presentationFormat = 'bgra8unorm';

    const swapChain = context.configureSwapChain({
        device,
        format: presentationFormat,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        size: presentationSize,
    });

    const pipeline = device.createRenderPipeline({
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
                    format: presentationFormat,
                },
            ],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });

    // -----------------------

    const buffer = device.createBuffer({
        size: Float32Array.BYTES_PER_ELEMENT * 6,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const dofParamsBuffer = device.createBuffer({
        size: Float32Array.BYTES_PER_ELEMENT * 3,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: { buffer },
            },
        ],
    });

    // -----------------------

    const postPipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: glslang.compileGLSL(window.SHADERS.vertex, 'vertex'),
            }),
            entryPoint: 'main',
        },
        fragment: {
            module: device.createShaderModule({
                code: glslang.compileGLSL(window.SHADERS.postFragment, 'fragment'),
            }),
            entryPoint: 'main',
            targets: [
                {
                    format: presentationFormat,
                },
            ],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });

    const cubeTexture = device.createTexture({
        size: presentationSize,
        format: presentationFormat,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    const postBindGroup = device.createBindGroup({
        layout: postPipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: { buffer },
            },
            {
                binding: 1,
                resource: device.createSampler({
                    magFilter: 'linear',
                    minFilter: 'linear',
                }),
            },
            {
                binding: 2,
                resource: cubeTexture.createView(),
            },
            {
                binding: 3,
                resource: { buffer: dofParamsBuffer },
            },
        ],
    });

    // -----------------------

    const renderPassDescriptor = {
        colorAttachments: [
            {
                view: undefined, // Assigned later

                loadValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
                storeOp: 'store',
            },
        ],
    };

    const timeBufferData = new Float32Array([0]);
    const mouseBufferData = new Float32Array([0, 0, 0]);
    const resolutionBufferData = new Float32Array([0, 0]);

    const dofParams = {
        far: 100,
        radius: 0.5,
        focusPoint: 88,
    };
    const dofParamsBufferData = new Float32Array([dofParams.far, dofParams.radius, dofParams.focusPoint]);
    const gui = new window.dat.GUI();
    gui.closed = true;
    gui.add(dofParams, 'far', 0, 1000)
        .name('DOF Far')
        .listen()
        .onChange((value) => {
            dofParamsBufferData[0] = value;
            device.queue.writeBuffer(dofParamsBuffer, 0, dofParamsBufferData.buffer, 0, 12);
        });

    gui.add(dofParams, 'radius', 0, 10)
        .name('DOF Radius')
        .listen()
        .onChange((value) => {
            dofParamsBufferData[1] = value;
            device.queue.writeBuffer(dofParamsBuffer, 0, dofParamsBufferData.buffer, 0, 12);
        });

    gui.add(dofParams, 'focusPoint', 0, 200)
        .name('DOF FocusPoint')
        .listen()
        .onChange((value) => {
            dofParamsBufferData[2] = value;
            device.queue.writeBuffer(dofParamsBuffer, 0, dofParamsBufferData.buffer, 0, 12);
        });

    device.queue.writeBuffer(dofParamsBuffer, 0, dofParamsBufferData.buffer, 0, 12);

    function frame(timestamp) {
        timeBufferData[0] = timestamp / 1000;
        device.queue.writeBuffer(buffer, 0, timeBufferData.buffer, 0, 4);

        const swapChainTexture = swapChain.getCurrentTexture();
        renderPassDescriptor.colorAttachments[0].view = swapChainTexture.createView();

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(6, 1, 0, 0);
        passEncoder.endPass();

        // Copy the rendering results from the swapchain into |cubeTexture|.
        commandEncoder.copyTextureToTexture(
            {
                texture: swapChainTexture,
            },
            {
                texture: cubeTexture,
            },
            presentationSize,
        );

        const postPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        postPassEncoder.setPipeline(postPipeline);
        postPassEncoder.setBindGroup(0, postBindGroup);
        postPassEncoder.draw(6, 1, 0, 0);
        postPassEncoder.endPass();

        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(frame);
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = e.target.getBoundingClientRect();
        const [x, y] = [e.clientX - rect.left, e.clientY - rect.top];

        mouseBufferData[0] = x;
        mouseBufferData[1] = y;
        device.queue.writeBuffer(buffer, 4, mouseBufferData.buffer, 0, 12);
    });

    canvas.addEventListener('mousedown', () => {
        mouseBufferData[2] = 1;
        device.queue.writeBuffer(buffer, 4, mouseBufferData.buffer, 0, 12);
    });

    const handleMouseUp = () => {
        mouseBufferData[2] = 0;
        device.queue.writeBuffer(buffer, 4, mouseBufferData.buffer, 0, 12);
    };
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    new ResizeObserver(() => {
        const { width, height } = canvas.parentElement.getBoundingClientRect();
        resolutionBufferData[0] = width;
        resolutionBufferData[1] = height;
        device.queue.writeBuffer(buffer, 16, resolutionBufferData.buffer, 0, 8);

        Object.assign(canvas, { width, height });
    }).observe(canvas.parentElement);

    requestAnimationFrame(frame);
})();
