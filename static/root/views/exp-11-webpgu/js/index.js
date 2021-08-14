(async () => {
    const glslangModule = await import('https://unpkg.com/@webgpu/glslang@0.0.15/dist/web-devel/glslang.js');
    const glslang = await glslangModule.default();

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
                    format: swapChainFormat,
                },
            ],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });

    // Fetch the image and upload it into a GPUTexture.
    let cubeTexture;
    {
        const img = document.createElement('img');
        img.src = './img/Di-3d.png';
        await img.decode();
        const imageBitmap = await createImageBitmap(img);

        cubeTexture = device.createTexture({
            size: [imageBitmap.width, imageBitmap.height, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture: cubeTexture }, [
            imageBitmap.width,
            imageBitmap.height,
        ]);
    }

    // -----------------------

    const buffer = device.createBuffer({
        size: Float32Array.BYTES_PER_ELEMENT * 5,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
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
        ],
    });

    // -----------------------

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
