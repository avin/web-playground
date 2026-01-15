import glob from 'fast-glob';

// Структура узла дерева
export interface TreeNode {
  name: string;
  path: string;
  children: Map<string, TreeNode>;
  isPage: boolean;
}

/**
 * Строит дерево страниц из найденных HTML файлов
 */
export function buildPageTree(): TreeNode {
  const pages = glob.sync('pages/**/*.html');

  // Построение дерева
  const root: TreeNode = {
    name: '',
    path: '',
    children: new Map(),
    isPage: false,
  };

  // Множество всех путей, которые являются страницами
  const pagePaths = new Set<string>();

  pages.forEach((page) => {
    const url = '/' + page.replace(/\\/g, '/').replace('index.html', '');
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    pagePaths.add(cleanUrl);

    const parts = cleanUrl.split('/').filter((p) => p);

    let current = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath += '/' + part;
      const isLast = index === parts.length - 1;

      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          path: currentPath,
          children: new Map(),
          isPage: isLast,
        });
      }

      current = current.children.get(part)!;
    });
  });

  // Отмечаем все промежуточные узлы, которые тоже являются страницами
  function markParentPages(node: TreeNode) {
    if (pagePaths.has(node.path) && node.path) {
      node.isPage = true;
    }
    node.children.forEach((child) => markParentPages(child));
  }
  markParentPages(root);

  return root;
}

/**
 * Генерирует HTML для дерева страниц в стиле консольной команды tree
 */
export function generateTreeHtml(
  node: TreeNode,
  prefix: string = '',
  isLast: boolean = true,
): string {
  if (node.children.size === 0 && !node.isPage) {
    return '';
  }

  let html = '';

  // Сортировка дочерних узлов - все вместе по имени
  const sortedChildren = Array.from(node.children.values()).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  sortedChildren.forEach((child, index) => {
    const isLastChild = index === sortedChildren.length - 1;
    const hasChildren = child.children.size > 0;
    const isPage = child.isPage;

    // Определяем символы для веток
    const connector = isLastChild ? '└── ' : '├── ';
    const spacer = isLastChild ? '    ' : '│   ';

    // Формируем строку с префиксом
    const linePrefix = prefix + connector;
    const nextPrefix = prefix + spacer;

    // Определяем тип элемента
    const itemType = hasChildren ? 'folder' : 'file';
    const itemClass = `tree-line tree-${itemType}${isPage ? ' tree-page' : ''}`;

    // Генерируем содержимое строки
    let content = '';
    if (isPage) {
      const relativePath = child.path.startsWith('/')
        ? child.path.slice(1)
        : child.path;
      content = `<a href="${relativePath}/" class="tree-link">${child.name}</a>`;
    } else {
      content = `<span class="tree-name">${child.name}</span>`;
    }

    html += `<div class="${itemClass}"><span class="tree-prefix">${linePrefix}</span>${content}</div>\n`;

    // Рекурсивно обрабатываем дочерние элементы (всегда показываем вложенные)
    if (hasChildren) {
      html += generateTreeHtml(child, nextPrefix, isLastChild);
    }
  });

  return html;
}
