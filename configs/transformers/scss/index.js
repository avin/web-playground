const { makeTest } = require('multi-static');
const sass = require('sass');
const path = require('path');

const scssTransformer = {
  beforeTest: ({ file }) => {
    file.servePath = file.servePath.replace(/\.scss$/, '.css');
    file.srcPath = file.srcPath.replace(/\.css$/, '.scss');
  },
  test: makeTest({
    check: ({ file }) => file.srcPath.endsWith('.scss'),
    checkFirstLine: (firstLine) => firstLine.startsWith('// @process'),
  }),
  processors: [
    ({ file }) => {
      const sassResult = sass.compile(file.srcPath, {
        loadPaths: [path.join(process.cwd())],
      });
      return sassResult.css;
    },
  ],
};

module.exports.scssTransformer = scssTransformer;
