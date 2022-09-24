const path = require('path');
const npmInstallSubfolders = require('npm-install-subfolders');

{
  for (const rootFolder of [
    path.resolve(process.cwd(), 'static'),
    path.resolve(process.cwd(), 'configs'),
  ]) {
    npmInstallSubfolders({
      rootFolder,
      verbose: true,
      client: 'yarn',
    });
  }
}
