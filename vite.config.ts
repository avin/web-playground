import { resolve } from 'node:path';
import { relative } from 'node:path';
import glob from 'fast-glob';
import { defineConfig } from 'vite';
import { generateIndexPlugin } from './scripts/plugins/generate-index';

export default defineConfig({
  root: '.',
  base: '/web-playground/',
  resolve: {
    alias: {
      '~common': resolve(__dirname, './common'),
    },
  },
  build: {
    rollupOptions: {
      input: getHtmlEntries(),
    },
  },
  plugins: [generateIndexPlugin()],
});

// Функция поиска HTML файлов для сборки
function getHtmlEntries(): Record<string, string> {
  const pages = glob.sync('pages/**/*.html', { absolute: true });
  return pages.reduce(
    (acc, pagePath) => {
      const name = relative(process.cwd(), pagePath)
        .replace(/\\/g, '/')
        .replace('/index.html', '');
      acc[name] = pagePath;
      return acc;
    },
    {} as Record<string, string>,
  );
}
