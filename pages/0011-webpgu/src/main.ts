import './main.scss';
import './lib/dat.gui/dat.gui.css';
import './shaders';

// Wait for dat.gui to be available (loaded via script tag in HTML)
function waitForDatGui(callback: () => void) {
  if ((window as any).dat) {
    callback();
  } else {
    setTimeout(() => waitForDatGui(callback), 50);
  }
}

waitForDatGui(() => {
  initWebGPU();
});

async function initWebGPU() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) return;

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const context = canvas.getContext('gpupresent') as any;
  // const context = canvas.getContext('webgpu');

  if (!context || !(navigator as any).gpu) {
    throw new Error('WebGPU does not work');
  }

  const adapter = await (navigator as any).gpu.requestAdapter();
  const device = await adapter.requestDevice();

  const devicePixelRatio = window.devicePixelRatio || 1;
  const presentationSize = [
    canvas.clientWidth * devicePixelRatio,
    canvas.clientHeight * devicePixelRatio,
  ];
  const presentationFormat = context.getPreferredFormat(adapter);
  // const presentationFormat = 'bgra8unorm';

  const swapChain = context.configureSwapChain({
    device,
    format: presentationFormat,
    usage:
      (window as any).GPUTextureUsage.RENDER_ATTACHMENT |
      (window as any).GPUTextureUsage.COPY_SRC,
    size: presentationSize,
  });

  const pipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: (window as any).SHADERS.vertex,
      }),
      entryPoint: 'main',
    },
    fragment: {
      module: device.createShaderModule({
        code: (window as any).SHADERS.fragment,
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
    size: Float32Array.BYTES_PER_ELEMENT * 8,
    usage:
      (window as any).GPUBufferUsage.UNIFORM |
      (window as any).GPUBufferUsage.COPY_DST,
  });

  const dofParamsBuffer = device.createBuffer({
    size: Float32Array.BYTES_PER_ELEMENT * 4,
    usage:
      (window as any).GPUBufferUsage.UNIFORM |
      (window as any).GPUBufferUsage.COPY_DST,
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
        code: (window as any).SHADERS.vertex,
      }),
      entryPoint: 'main',
    },
    fragment: {
      module: device.createShaderModule({
        code: (window as any).SHADERS.postFragment,
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

  const renderPassDescriptor = {
    colorAttachments: [
      {
        view: undefined,
        loadValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
        storeOp: 'store',
      },
    ],
  };

  const timeBufferData = new Float32Array([0]);
  const mouseBufferData = new Float32Array([0, 0, 0]);
  const resolutionBufferData = new Float32Array([0, 0]);

  const params = {
    fov: 0.77,
    dofFar: 100,
    dofRadius: 1.0,
    dofFocusPoint: 88,
    noiseFactor: 0.25,
  };
  const fovBufferData = new Float32Array([params.fov]);
  const dofParamsBufferData = new Float32Array([
    params.dofFar,
    params.dofRadius,
    params.dofFocusPoint,
    params.noiseFactor,
  ]);
  const noiseFactorBufferData = new Float32Array([params.noiseFactor]);
  const gui = new (window as any).dat.GUI();
  gui.closed = true;
  gui
    .add(params, 'fov', 0.5, 1.5)
    .name('FOV')
    .listen()
    .onChange((value: number) => {
      fovBufferData[0] = value;
      device.queue.writeBuffer(buffer, 24, fovBufferData.buffer, 0, 4);
    });
  device.queue.writeBuffer(buffer, 24, fovBufferData.buffer, 0, 4);

  gui
    .add(params, 'dofFar', 0, 1000)
    .name('DOF Far')
    .listen()
    .onChange((value: number) => {
      dofParamsBufferData[0] = value;
      device.queue.writeBuffer(
        dofParamsBuffer,
        0,
        dofParamsBufferData.buffer,
        0,
        16,
      );
    });

  gui
    .add(params, 'dofRadius', 0, 10)
    .name('DOF Radius')
    .listen()
    .onChange((value: number) => {
      dofParamsBufferData[1] = value;
      device.queue.writeBuffer(
        dofParamsBuffer,
        0,
        dofParamsBufferData.buffer,
        0,
        16,
      );
    });

  gui
    .add(params, 'dofFocusPoint', 0, 200)
    .name('DOF FocusPoint')
    .listen()
    .onChange((value: number) => {
      dofParamsBufferData[2] = value;
      device.queue.writeBuffer(
        dofParamsBuffer,
        0,
        dofParamsBufferData.buffer,
        0,
        16,
      );
    });
  gui
    .add(params, 'noiseFactor', 0, 1)
    .name('DOF Smooth')
    .listen()
    .onChange((value: number) => {
      noiseFactorBufferData[0] = value;
      device.queue.writeBuffer(buffer, 28, noiseFactorBufferData.buffer, 0, 4);
    });
  device.queue.writeBuffer(buffer, 28, noiseFactorBufferData.buffer, 0, 4);

  device.queue.writeBuffer(
    dofParamsBuffer,
    0,
    dofParamsBufferData.buffer,
    0,
    16,
  );

  let cubeTexture: any;
  let postBindGroup: any;
  function frame(timestamp: number) {
    if (
      canvas.clientWidth !== presentationSize[0] ||
      canvas.clientHeight !== presentationSize[1] ||
      !cubeTexture ||
      !postBindGroup
    ) {
      const { width, height } = (
        canvas.parentElement as HTMLElement
      ).getBoundingClientRect();
      resolutionBufferData[0] = width;
      resolutionBufferData[1] = height;
      device.queue.writeBuffer(buffer, 16, resolutionBufferData.buffer, 0, 8);

      Object.assign(canvas, { width, height });

      if (cubeTexture !== undefined) {
        // Destroy the previous render target
        cubeTexture.destroy();
      }

      presentationSize[0] = canvas.clientWidth;
      presentationSize[1] = canvas.clientHeight;

      cubeTexture = device.createTexture({
        size: presentationSize,
        format: presentationFormat,
        usage:
          (window as any).GPUTextureUsage.TEXTURE_BINDING |
          (window as any).GPUTextureUsage.COPY_DST,
      });

      postBindGroup = device.createBindGroup({
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
    }

    timeBufferData[0] = timestamp / 1000;
    device.queue.writeBuffer(buffer, 0, timeBufferData.buffer, 0, 4);

    const swapChainTexture = swapChain.getCurrentTexture();
    renderPassDescriptor.colorAttachments[0].view =
      swapChainTexture.createView();

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

    const postPassEncoder =
      commandEncoder.beginRenderPass(renderPassDescriptor);
    postPassEncoder.setPipeline(postPipeline);
    postPassEncoder.setBindGroup(0, postBindGroup);
    postPassEncoder.draw(6, 1, 0, 0);
    postPassEncoder.endPass();

    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(frame);
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
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

  requestAnimationFrame(frame);
}
