/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  ignorePatterns: ['**/dist/**', '**/node_modules/**'],
  settings: {
    'import/resolver': {
      typescript: true,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
}
