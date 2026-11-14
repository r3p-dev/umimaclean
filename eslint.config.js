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
        'warn',
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
    // shadcn CLI output: style rules its code doesn't follow are off here, so `shadcn add` can
    // keep updating these files untouched (docs/CONVENTIONS.md §3, §9).
    name: 'Generated shadcn components',
    files: ['inertia/components/ui/**'],
    rules: {
      'eqeqeq': 'off',
      '@typescript-eslint/no-shadow': 'off',
      'tailwind-canonical-classes/tailwind-canonical-classes': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  }
)
