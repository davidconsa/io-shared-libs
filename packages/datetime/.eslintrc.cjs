'use strict';

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['../../packages/shared-configs/eslint/index.cjs'],
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.jest.json'],
    tsconfigRootDir: __dirname,
  },
  overrides: [
    {
      files: ['test/**/*.ts'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
  ],
};
