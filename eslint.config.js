import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
  // Игнорируемые файлы и директории
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.vite/**',
      '**/*.min.js',
      '**/coverage/**',
      '**/.nyc_output/**',
    ],
  },

  // Базовые рекомендованные правила ESLint
  eslint.configs.recommended,

  // TypeScript конфигурация без строгой проверки типов
  ...tseslint.configs.recommended,

  // Основной конфиг для TypeScript/JavaScript файлов
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-empty': 'off',
      'consistent-return': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'dir'] }],
      'spaced-comment': ['warn', 'always', { markers: ['/'] }],
      '@typescript-eslint/no-unused-vars': [
        1,
        { args: 'none', ignoreRestSiblings: true, varsIgnorePattern: 'styles' },
      ],
    },
  },

  // Только для JS файлов
  {
    files: ['**/*.js', '**/*.jsx'],
  },

  // Prettier должен быть последним
  prettier,
);
