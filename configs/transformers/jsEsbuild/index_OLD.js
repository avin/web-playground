const { makeTest } = require('multi-static');
const { build: esbuildBuild } = require('esbuild');
const { glsl } = require('esbuild-plugin-glsl');
const inlineImportPlugin = require('esbuild-plugin-inline-import');

const clients = {};
const cache = {};

const applyEsbuildMiddleware = (app) => {
  app.get('/esbuild', async function (req, res) {
    const srcPath = req.query.srcPath;
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
    });
    res.flushHeaders();

    clients[srcPath] ||= [];
    clients[srcPath].push(res);
  });
};

const jsEsbuildTransformer = {
  test: makeTest({
    check: ({ file }) => file.srcPath.endsWith('.js'),
    checkFirstLine: (firstLine) => firstLine.startsWith('// @process'),
  }),
  processors: [
    async ({ file, mode }) => {
      if (!cache[file.srcPath]) {
        const buildResult = await esbuildBuild({
          entryPoints: [file.srcPath],
          outfile: 'out.js',
          write: false,
          platform: 'browser',
          bundle: true,
          format: 'iife',
          metafile: false,
          target: 'es2015',
          minify: mode === 'build',
          logLevel: 'silent',
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
          ...(mode === 'dev' && {
            banner: {
              js: `(() => new EventSource("/esbuild?srcPath=${encodeURIComponent(
                file.srcPath,
              )}").onmessage = () => location.reload())();`,
            },
            watch: {
              onRebuild(error, buildResult) {
                if (error) {
                  console.log('ESBuild:', error);
                  return;
                }

                cache[file.srcPath] = buildResult.outputFiles[0].text;

                if (clients[file.srcPath]) {
                  clients[file.srcPath].forEach((res) => {
                    res.write('data: update\n\n');
                  });
                  clients[file.srcPath].length = 0;
                }

                console.log('ESBuild: code rebuilt successfully');
              },
            },
          }),
        });

        cache[file.srcPath] = buildResult.outputFiles[0].text;
      }

      return cache[file.srcPath];
    },
  ],
};

const tsEsbuildTransformer = {
  ...jsEsbuildTransformer,
  beforeTest: ({ file }) => {
    file.servePath = file.servePath.replace(/\.ts$/, '.js');
    file.srcPath = file.srcPath.replace(/\.js$/, '.ts');
  },
  test: makeTest({
    check: ({ file }) => file.srcPath.endsWith('.ts'),
    checkFirstLine: (firstLine) => firstLine.startsWith('// @process'),
  }),
};

module.exports.applyEsbuildMiddleware = applyEsbuildMiddleware;
module.exports.jsEsbuildTransformer = jsEsbuildTransformer;
module.exports.tsEsbuildTransformer = tsEsbuildTransformer;
