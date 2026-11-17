import adonisConfig from '@adonisjs/prettier-config'

// With proseWrap "never", Prettier prints a table that is wider than printWidth without padding
// every cell to its column width, so wide tables in docs/ stay small and readable as plain text.
// docs/ paragraphs are not hard-wrapped, so this changes nothing else there (docs/ARCHITECTURE.md D85).
export default {
  ...adonisConfig,
  overrides: [{ files: 'docs/**/*.md', options: { proseWrap: 'never' } }],
}
