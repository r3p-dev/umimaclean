import { configApp } from '@adonisjs/eslint-config'
import { react } from '@adonisjs/eslint-config/react'

export default configApp(
  ...react,
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
    // shadcn CLI output: two style rules its code doesn't follow are off here, so `shadcn add` can
    // keep updating these files untouched (docs/CONVENTIONS.md §3, §9).
    name: 'Generated shadcn components',
    files: ['inertia/components/ui/**'],
    rules: { 'eqeqeq': 'off', '@typescript-eslint/no-shadow': 'off' },
  }
)
