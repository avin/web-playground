const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const safeEval = require('./safeEval');
const Mustache = require('mustache');

// Отключаем экранирование строк, нам важно хранить в переменных HTML
Mustache.escape = (text) => text;

/**
 * Пропустить файл через mustache
 * @param fileSrc
 * @param customOptions
 * @param originalFileSrc - изначальный обрабатываемый файл (для случаев когда происходит обработка внутренних чанков)
 * @returns {*}
 */
const mustacheProcessFile = (fileSrc, customOptions = {}, originalFileSrc) => {
  const data = fs.readFileSync(fileSrc, 'utf8');

  return Mustache.render(data, {
    /**
     * Выполнить код
     */
    eval: () => {
      return (text, render) => {
        return render(String(safeEval(text)));
      };
    },

    /**
     * Подгрузить содержимое чанк-файла
     */
    chunk: () => {
      return (text, render) => {
        const chunkLocation = fileSrc
          .split(path.sep)
          .slice(0, -1)
          .join(path.sep);
        const chunkFile = path.join(chunkLocation, text);
        let chunkContent;
        try {
          chunkContent = mustacheProcessFile(
            chunkFile,
            customOptions,
            originalFileSrc || fileSrc,
          );
        } catch (e) {
          console.warn(`(!) Chunk read error. ${chunkFile}`);
        }

        return chunkContent || '';
      };
    },

    listSubFolders: () => {
      return (text, render) => {
        const folder = fileSrc.split(path.sep).slice(0, -1).join(path.sep);
        const dirs = fs
          .readdirSync(folder, { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => dirent.name)
          .filter((dir) => /^\d/.test(dir));

        return dirs.reduce((acc, dir) => {
          return acc + text.replace(/__FOLDER__/g, dir);
        }, '');
      };
    },

    ...customOptions.variables,
  });
};

module.exports = mustacheProcessFile;
