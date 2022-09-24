const { makeTest } = require('multi-static');
const path = require('path');
const { build: esbuildBuild } = require('esbuild');
const { glsl } = require('esbuild-plugin-glsl');
const inlineImportPlugin = require('esbuild-plugin-inline-import');

const jsEsbuildTransformer = {
  test: makeTest({
    check: ({ file }) => file.srcPath.endsWith('.js'),
    checkFirstLine: (firstLine) => firstLine.startsWith('// @process'),
  }),
  processors: [
    async ({ file, mode }) => {
      const result = await esbuildBuild({
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
      });
      const { text } = result.outputFiles[0];
      return text;
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

module.exports.jsEsbuildTransformer = jsEsbuildTransformer;
module.exports.tsEsbuildTransformer = tsEsbuildTransformer;
