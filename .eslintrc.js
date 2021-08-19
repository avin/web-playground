module.exports = {
    parser: '@babel/eslint-parser',
    extends: ['airbnb-base', 'prettier'],
    env: {
        browser: true,
    },
    globals: {
        GPUBufferUsage: 'readonly',
        GPUShaderStage: 'readonly',
    },
    rules: {
      'global-require': 0,
      'consistent-return': 0,
      'spaced-comment': ['warn', 'always', { markers: ['/'] }],
      curly: ['error', 'all'],
      'no-unused-vars': [1, { args: 'none', ignoreRestSiblings: true }],
      'no-underscore-dangle': [
        1,
        {
          allow: ['__REDUX_DEVTOOLS_EXTENSION__'],
        },
      ],
      'prefer-destructuring': 0,
      'jsx-a11y/control-has-associated-label': 0,
      'jsx-a11y/label-has-associated-control': 0,
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'dir'] }],
      'no-param-reassign': 0,
      'no-void': 0,
      'no-new': 0,
      'arrow-body-style': 0,
      'import/order': 0,
      'import/prefer-default-export': 0,
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.ts',
            '**/*.fixture.tsx',
            './configs/**',
          ],
        },
      ],

    },
};
