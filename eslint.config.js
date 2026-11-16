import { configApp } from '@adonisjs/eslint-config'
import { react } from '@adonisjs/eslint-config/react'
import tailwindCanonicalClasses from 'eslint-plugin-tailwind-canonical-classes'

export default configApp(
  ...react,
  {
    // Enforce canonical Tailwind v4 classes in Inertia components (docs/CONVENTIONS.md §9).
    name: 'Tailwind canonical classes',
    files: ['inertia/**/*.tsx'],
    plugins: {
      'tailwind-canonical-classes': tailwindCanonicalClasses,
    },
    rules: {
      'tailwind-canonical-classes/tailwind-canonical-classes': [
        'error',
        { cssPath: './inertia/css/app.css' },
      ],
    },
  },
  {
    name: 'No deprecated APIs (docs/CONVENTIONS.md §12)',
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['.adonisjs/**'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: { '@typescript-eslint/no-deprecated': 'error' },
  },
  {
    // Inertia's <Head> uses head-key to replace a tag instead of adding a second one.
    name: 'Inertia head keys',
    files: ['inertia/**/*.tsx'],
    rules: { 'react/no-unknown-property': ['error', { ignore: ['head-key'] }] },
  },
  {
    // Project code style conventions (docs/CONVENTIONS.md §3, §4).
    name: 'Project code conventions',
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['.adonisjs/**'],
    rules: {
      'func-style': ['error', 'declaration'],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportAllDeclaration',
          message:
            'Re-exports are not allowed. A module only exports what it defines itself; import directly from the defining module.',
        },
        {
          selector: 'ExportNamedDeclaration[source]',
          message:
            'Re-exports are not allowed. A module only exports what it defines itself; import directly from the defining module.',
        },
        {
          selector: 'ImportNamespaceSpecifier',
          message:
            'Namespace imports (import * as ...) are not allowed. Import only what you use by name.',
        },
      ],
    },
  }
)
