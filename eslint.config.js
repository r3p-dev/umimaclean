import { configApp } from '@adonisjs/eslint-config'
import { react } from '@adonisjs/eslint-config/react'

export default configApp(...react, {
  name: 'No deprecated APIs (docs/CONVENTIONS.md §12)',
  files: ['**/*.ts', '**/*.tsx'],
  ignores: ['.adonisjs/**'],
  languageOptions: {
    parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
  },
  rules: { '@typescript-eslint/no-deprecated': 'error' },
})
