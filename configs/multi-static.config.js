const fs = require('fs-extra');
const { defineConfig, getFilesList } = require('multi-static');
const staticHashVersion = require('static-hash-version');
const localhostCerts = require('localhost-certs');
const { scssTransformer } = require('./transformers/scss');
const { htmlMustacheTransformer } = require('./transformers/htmlMustache');
const {
  jsEsbuildTransformer,
  tsEsbuildTransformer,
  applyEsbuildMiddleware,
} = require('./transformers/jsEsbuild');
const { middleware: fakeApiMiddleware } = require('fake-api-middleware');

module.exports = defineConfig({
  mapping: [['./static/root', '/']],

  http: {
    port: 8080,
    ...localhostCerts(),
  },

  transformers: [
    scssTransformer,
    jsEsbuildTransformer,
    tsEsbuildTransformer,
    htmlMustacheTransformer,
  ],

  onBeforeBuild() {
    fs.removeSync(this.buildPath);
  },

  onAfterBuild() {
    // Process tags with links to files and substitute prefixes with hashes for links
    getFilesList('./build')
      .filter((i) => i.endsWith('.html'))
      .forEach((htmlFile) => {
        staticHashVersion({
          htmlFilePath: htmlFile,
          writeToFile: true,
        });
      });
  },

  onBeforeSetupMiddleware({ app }) {
    applyEsbuildMiddleware(app);

    app.use(
      fakeApiMiddleware({
        responsesFile: './configs/mockApi/index.ts',
        watchFiles: ['./configs/mockApi'],
        enable: true,
        responseDelay: 300,
      }),
    );
  },
});
