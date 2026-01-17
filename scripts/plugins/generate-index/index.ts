import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type Plugin } from 'vite';
import { buildPageTree, generateTreeHtml } from './tree-builder';

/**
 * Плагин для генерации индексной страницы со списком всех доступных страниц
 */
export function generateIndexPlugin(): Plugin {
  // Используем относительный путь от корня проекта
  const pluginDir = resolve(process.cwd(), 'scripts/plugins/generate-index');
  const templatePath = resolve(pluginDir, 'template.html');
  const stylesPath = resolve(pluginDir, 'styles.css');

  return {
    name: 'generate-index',

    // Часть для DEV-режима (сервер)
    configureServer(server) {
      const base = normalizeBase(server.config.base);
      const indexPaths = getIndexPaths(base);
      const stylesUrl = `${base}scripts/plugins/generate-index/styles.css`;

      // Генерируем индексную страницу (должен быть первым, чтобы перехватывать корневой путь)
      server.middlewares.use((req, res, next) => {
        const urlPath = getPathname(req.url);
        if (indexPaths.has(urlPath)) {
          const html = generateHtml(true, base);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
          return;
        }
        next();
      });

      // Отдаём статические файлы (CSS) - должны быть после обработки корня
      server.middlewares.use((req, res, next) => {
        const urlPath = getPathname(req.url);
        if (urlPath === stylesUrl) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
          res.end(readFileSync(stylesPath));
          return;
        }
        next();
      });
    },

    // Часть для BUILD-режима (сборка)
    generateBundle(options, bundle) {
      const html = generateHtml(false);

      // Добавляем файл в итоговый бандл
      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: html,
      });
    },
  };

  function generateHtml(isDev: boolean = false, base: string = '/'): string {
    const tree = buildPageTree();
    const treeHtml = generateTreeHtml(tree);
    const template = readFileSync(templatePath, 'utf-8');

    let styles: string;

    if (isDev) {
      // В dev режиме используем ссылки на файлы
      styles = `<link rel="stylesheet" href="${base}scripts/plugins/generate-index/styles.css">`;
    } else {
      // В build режиме встраиваем стили напрямую
      styles = `<style>${readFileSync(stylesPath, 'utf-8')}</style>`;
    }

    return template
      .replace('{{TREE_CONTENT}}', treeHtml)
      .replace('{{STYLES}}', styles);
  }
}

function getPathname(url?: string): string {
  if (!url) {
    return '/';
  }
  return url.split('?')[0].split('#')[0];
}

function normalizeBase(base: string | undefined): string {
  if (!base || base === './') {
    return '/';
  }
  let normalized = base;
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }
  if (!normalized.endsWith('/')) {
    normalized = `${normalized}/`;
  }
  return normalized;
}

function getIndexPaths(base: string): Set<string> {
  if (base === '/') {
    return new Set(['/', '/index.html']);
  }
  const baseNoTrailingSlash = base.endsWith('/') ? base.slice(0, -1) : base;
  return new Set([base, `${base}index.html`, baseNoTrailingSlash]);
}
