/*
Próximos passos sugeridos
- Remover .eslintignore (adotando apenas eslint.config.js) para eliminar o warning.
- Acrescentar migrations Prisma equivalentes ao SQL existente ou padronizar em uma abordagem (Prisma migrations vs SQL).
- Adicionar validação com Zod nos bodies dos endpoints e códigos de erro consistentes.
- Incluir seed mínimo (ex.: Tenant e 1-2 Employees) para facilitar testes locais.
- Observabilidade e autenticação real (JWT + RBAC) nas rotas sensíveis.
*/
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
  ignorePatterns: ['**/dist/**', '**/node_modules/**', '**/.next/**'],
  settings: {
    'import/resolver': {
      typescript: true,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
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
