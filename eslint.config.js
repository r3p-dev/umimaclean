import { configApp } from '@adonisjs/eslint-config'
import { react } from '@adonisjs/eslint-config/react'

const referenceClone = { ignores: ['skripsi/**'] }

export default configApp(...react, referenceClone, {
  name: 'Project style rules',
  files: ['**/*.ts', '**/*.tsx'],
  ignores: ['.adonisjs/**'],
  rules: {
    'curly': ['error', 'all'],
    '@unicorn/no-array-for-each': 'error',
    '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    'no-restricted-syntax': [
      'error',
      {
        selector: ':matches(MethodDefinition, Property)[kind=/^(get|set)$/]',
        message: 'Use a method instead of a get/set accessor.',
      },
      {
        selector: '[accessibility="private"]',
        message: 'Use a native #private member instead of the private modifier.',
      },
    ],
    'id-denylist': ['error', 'a', 'b', 'c', 'i', 'j', 'k', 'n', 't', 'qs', 'trx', 'addr'],
    '@unicorn/prevent-abbreviations': [
      'error',
      {
        checkFilenames: false,
        checkProperties: false,
        allowList: {
          ctx: true,
          props: true,
          Props: true,
          ref: true,
          Ref: true,
          refs: true,
          params: true,
          env: true,
          db: true,
          args: true,
        },
      },
    ],
  },
})
