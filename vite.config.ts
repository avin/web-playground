import { resolve } from 'node:path';
import { relative } from 'node:path';
import glob from 'fast-glob';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import solid from 'vite-plugin-solid';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import vue from '@vitejs/plugin-vue';
import { generateIndexPlugin } from './scripts/plugins/generate-index';
import localhostCerts from 'vite-plugin-localhost-certs';

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
  plugins: [
    react({
      include: ['pages/0016-test-react/src/**/*.{ts,tsx,js,jsx}'],
    }),
    solid({
      include: [
        'pages/0017-test-solid/src/**/*.{ts,tsx,js,jsx}',
        'pages/0020-tabs/src/**/*.{ts,tsx,js,jsx}',
        'pages/0021-card-form/src/**/*.{ts,tsx,js,jsx}',
      ],
    }),
    svelte({
      include: ['pages/0018-test-svelte/src/**/*.svelte'],
    }),
    vue({
      include: ['pages/0019-test-vue/src/**/*.vue'],
    }),
    localhostCerts(),
    generateIndexPlugin(),
  ],
  server: {
    host: '0.0.0.0',
    port: 8888,
  },
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
