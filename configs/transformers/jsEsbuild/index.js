const path = require('path');
const { existsSync } = require('fs');
const { mkdir, writeFile } = require('fs/promises');
const { makeTest } = require('multi-static');
const esbuild = require('esbuild');
const { glsl } = require('esbuild-plugin-glsl');
const inlineImportPlugin = require('esbuild-plugin-inline-import');

const staticRoot = path.resolve(process.cwd(), 'static');
const virtualOutDir = path.join(process.cwd(), '.multi-static-esbuild');

const buildCache = new Map();
const registeredContexts = new Set();
let shutdownHooksAttached = false;

const attachShutdownHooks = () => {
  if (shutdownHooksAttached) {
    return;
  }

  const disposeAll = () => {
    for (const ctx of registeredContexts) {
      ctx.dispose().catch(() => {
        // ignore
      });
    }
  };

  process.once('SIGINT', disposeAll);
  process.once('SIGTERM', disposeAll);
  process.once('exit', disposeAll);

  shutdownHooksAttached = true;
};

const toOsPath = (servePath) =>
  servePath
    .replace(/^[\\/]+/, '')
    .split('/')
    .join(path.sep);
const toPosixPath = (servePath) =>
  servePath.replace(/^[\\/]+/, '').replace(/\\/g, '/');
const makeCacheKey = (entryPath, servePath, mode) =>
  `${path.resolve(entryPath)}::${servePath}::${mode}`;

const createBuildOptions = (entryPath, servePath, mode) => {
  const relativeEntry = path.relative(staticRoot, entryPath);
  const normalizedServePath = toOsPath(servePath);

  return {
    absWorkingDir: staticRoot,
    entryPoints: [relativeEntry],
    bundle: true,
    format: 'esm',
    sourcemap: mode === 'build',
    metafile: true,
    write: false,
    outfile: path.join(virtualOutDir, normalizedServePath),
    logLevel: 'silent',
    minify: mode === 'build',
    target: ['es2018'],
    define: {
      'process.env.NODE_ENV':
        mode === 'build' ? '"production"' : '"development"',
    },
    plugins: [
      glsl({
        minify: true,
      }),
      inlineImportPlugin({
        filter: /^raw:/,
      }),
    ],
  };
};

const createEsbuildContext = async (entryPath, servePath, mode) => {
  const options = createBuildOptions(entryPath, servePath, mode);

  if (typeof esbuild.context === 'function') {
    return esbuild.context(options);
  }

  const legacyOptions = {
    ...options,
    incremental: true,
  };

  let incrementalResult = await esbuild.build(legacyOptions);
  let firstRun = true;

  return {
    rebuild: async () => {
      if (firstRun) {
        firstRun = false;
        return incrementalResult;
      }

      if (incrementalResult.rebuild) {
        incrementalResult = await incrementalResult.rebuild();
        return incrementalResult;
      }

      incrementalResult = await esbuild.build(legacyOptions);
      return incrementalResult;
    },
    dispose: async () => {
      if (
        incrementalResult &&
        incrementalResult.rebuild &&
        typeof incrementalResult.rebuild.dispose === 'function'
      ) {
        incrementalResult.rebuild.dispose();
      }
    },
  };
};

const ensureContext = async (cacheKey, entryPath, servePath, mode) => {
  let cacheEntry = buildCache.get(cacheKey);

  if (!cacheEntry) {
    const context = await createEsbuildContext(entryPath, servePath, mode);
    cacheEntry = { context };
    buildCache.set(cacheKey, cacheEntry);
    registeredContexts.add(context);
    attachShutdownHooks();
  }

  return cacheEntry;
};

const disposeContext = async (cacheKey) => {
  const cacheEntry = buildCache.get(cacheKey);
  if (!cacheEntry) {
    return;
  }

  buildCache.delete(cacheKey);
  registeredContexts.delete(cacheEntry.context);

  try {
    await cacheEntry.context.dispose();
  } catch (error) {
    // ignore
  }
};

const rebuildWithCache = async (cacheEntry) => {
  if (!cacheEntry.pending) {
    cacheEntry.pending = cacheEntry.context
      .rebuild()
      .then((result) => {
        cacheEntry.pending = undefined;
        return result;
      })
      .catch((error) => {
        cacheEntry.pending = undefined;
        throw error;
      });
  }

  return cacheEntry.pending;
};

const ensureDir = async (dirPath) => {
  await mkdir(dirPath, { recursive: true });
};

const findOutputByServePath = (servePath, outputFiles) => {
  const normalized = toPosixPath(servePath);

  for (const file of outputFiles) {
    const relative = path
      .relative(virtualOutDir, file.path)
      .split(path.sep)
      .join('/');
    if (relative === normalized && file.path.endsWith('.js')) {
      return file;
    }
  }

  return outputFiles.find((file) => file.path.endsWith('.js'));
};

const writeOutputsToBuildDir = async (buildPath, outputFiles) => {
  for (const file of outputFiles) {
    const relative = path
      .relative(virtualOutDir, file.path)
      .split(path.sep)
      .join(path.posix.sep);
    const destination = path.join(buildPath, relative);
    await ensureDir(path.dirname(destination));
    await writeFile(destination, file.contents);
  }
};

const esbuildBundleTransformer = {
  beforeTest: ({ file, mode }) => {
    const originalServeExt = path.extname(file.servePath);
    const originalSrcExt = path.extname(file.srcPath);

    if (
      mode === 'build' &&
      ['.ts', '.js'].includes(originalSrcExt) &&
      originalServeExt === '.ts'
    ) {
      file.servePath = file.servePath.replace(/\.ts$/, '.js');
    }

    if (originalSrcExt === '.js') {
      const tsCandidate = file.srcPath.replace(/\.js$/, '.ts');
      if (existsSync(tsCandidate)) {
        file.srcPath = tsCandidate;
      }
    }
  },
  test: makeTest({
    check: ({ file }) => ['.js', '.ts'].includes(path.extname(file.srcPath)),
    checkFirstLine: (firstLine) => firstLine.trim().startsWith('// @process'),
  }),
  sendResponse: async ({ file, res, next }) => {
    try {
      const mode = 'dev';
      const cacheKey = makeCacheKey(file.srcPath, file.servePath, mode);
      const cacheEntry = await ensureContext(
        cacheKey,
        file.srcPath,
        file.servePath,
        mode,
      );
      const result = await rebuildWithCache(cacheEntry);
      const outputFiles = result.outputFiles || [];

      const jsOutput = findOutputByServePath(file.servePath, outputFiles);
      if (!jsOutput) {
        throw new Error(`esbuild output for ${file.servePath} not found`);
      }

      res.setHeader('Content-Type', 'application/javascript');
      res.send(jsOutput.text);
    } catch (error) {
      next(error);
    }
  },
  writeContent: async ({ file, buildPath, mode }) => {
    const cacheKey = makeCacheKey(file.srcPath, file.servePath, mode);
    const cacheEntry = await ensureContext(
      cacheKey,
      file.srcPath,
      file.servePath,
      mode,
    );
    const result = await rebuildWithCache(cacheEntry);
    const outputFiles = result.outputFiles || [];

    await writeOutputsToBuildDir(buildPath, outputFiles);

    if (mode === 'build') {
      await disposeContext(cacheKey);
    }
  },
};

module.exports = { esbuildBundleTransformer };
