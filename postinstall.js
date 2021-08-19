const path = require('path');
const npmInstallSubfolders = require('npm-install-subfolders');

npmInstallSubfolders({
  rootFolder: path.resolve(process.cwd(), 'static'),
  verbose: true,
});
