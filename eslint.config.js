// Flat config for ESLint v9
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      'coverage/**',
      '.eslintrc.cjs',
      '**/.eslintrc.cjs',
      '.eslintignore',
      'eslint.config.js',
      '**/jest.config.js',
      // Ignore optional/experimental areas in hrplus-api until stabilized
      'services/hrplus-api/prisma/**',
      'services/hrplus-api/src/integrations/**',
      'services/hrplus-api/src/middleware/**',
      'services/hrplus-api/src/modules/**',
      'services/hrplus-api/src/routes/ai-insights.ts',
      'services/hrplus-api/src/routes/analytics.ts',
      'services/hrplus-api/src/routes/revenue.ts',
      'services/hrplus-api/src/routes/auth-enhanced.ts',
      'services/hrplus-api/src/routes/admin.ts',
      'services/hrplus-api/src/routes/marketplace.ts',
      'services/hrplus-api/src/sdk/**',
      'services/hrplus-api/src/lib/cache-optimizer.ts',
      'services/hrplus-api/src/lib/performance.ts',
      'services/hrplus-api/src/lib/report-builder.ts',
      'services/hrplus-api/src/lib/sso.ts',
      'services/hrplus-api/src/lib/webhook-dispatcher.ts',
      'services/hrplus-api/src/swagger.ts',
      'services/hrplus-api/src/lib/i18n.ts',
      'services/hrplus-api/src/lib/push-notifications.ts',
      'services/hrplus-api/src/marketplace/**',
      'services/hrplus-api/src/routes/modules.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Overrides for config and runtime-specific files
  {
    files: [
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.mjs',
      '**/*.config.ts',
      '**/next.config.js',
      '**/postcss.config.js',
      '**/tailwind.config.js',
      '**/eslint.config.js',
    ],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        module: 'writable',
        __dirname: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },
  // Service worker globals and relaxed rules
  {
    files: ['apps/web/public/sw.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        self: 'readonly',
        caches: 'readonly',
        clients: 'readonly',
        workbox: 'readonly',
        fetch: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
      'no-restricted-globals': 'off',
      'no-useless-catch': 'off',
    },
  },
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_$|^err(or)?$',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  // Allow @ts-nocheck temporarily on some legacy pages while types are improved
  {
    files: ['apps/web/app/**/page.tsx', 'apps/web/lib/auth.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  prettier,
]
