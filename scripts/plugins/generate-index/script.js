(function () {
  'use strict';

  // Инициализация при загрузке страницы
  document.addEventListener('DOMContentLoaded', function () {
    initTree();
  });

  function initTree() {
    const toggleButtons = document.querySelectorAll('.tree-toggle');

    // Обработка кликов по кнопкам раскрытия
    toggleButtons.forEach((button) => {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const listItem = this.closest('.tree-item');
        if (listItem) {
          const wasCollapsed = listItem.classList.contains('collapsed');
          listItem.classList.toggle('collapsed');

          // Обновляем aria-expanded
          const isCollapsed = listItem.classList.contains('collapsed');
          this.setAttribute('aria-expanded', !isCollapsed);

          // Сохраняем состояние
          const path = this.getAttribute('data-path');
          if (path) {
            if (isCollapsed) {
              localStorage.setItem(`tree-state-${path}`, 'collapsed');
            } else {
              localStorage.removeItem(`tree-state-${path}`);
            }
          }
        }
      });
    });

    // Восстановление состояния из localStorage
    const treeItems = document.querySelectorAll('.tree-item.tree-folder');

    treeItems.forEach((item) => {
      const toggle = item.querySelector('.tree-toggle');
      if (toggle) {
        const path = toggle.getAttribute('data-path');
        if (path) {
          const savedState = localStorage.getItem(`tree-state-${path}`);
          if (savedState === 'collapsed') {
            item.classList.add('collapsed');
            toggle.setAttribute('aria-expanded', 'false');
          } else {
            toggle.setAttribute('aria-expanded', 'true');
          }
        }
      }
    });

    // Улучшенная навигация с клавиатуры
    treeItems.forEach((item) => {
      const toggle = item.querySelector('.tree-toggle');
      if (toggle) {
        toggle.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
          }
        });
      }
    });
  }

  // Экспорт для возможного использования извне
  window.treeIndex = {
    init: initTree,
  };
})();
