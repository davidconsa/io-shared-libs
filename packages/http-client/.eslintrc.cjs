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
        // jest pattern: expect(mock.method).toHaveBeenCalled()
        '@typescript-eslint/unbound-method': 'off',
        // jest mock.calls is typed as any[][] when generics don't propagate
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
  ],
};
