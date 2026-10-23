import { test } from '@japa/runner'
import { CROCKFORD_ALPHABET, newPublicCode, normalizePublicCode } from '#services/order_service'

test.group('Public order code', () => {
  test('uses UMC- and six Crockford Base32 characters', ({ assert }) => {
    for (let index = 0; index < 200; index++) {
      const code = newPublicCode()
      assert.match(code, /^UMC-[0-9A-HJKMNP-TV-Z]{6}$/)
    }
    assert.lengthOf(CROCKFORD_ALPHABET, 32)
    assert.notMatch(CROCKFORD_ALPHABET, /[ILOU]/)
  })

  test('normalizes "{input}" to {expected}')
    .with([
      { input: 'UMC-8F3K2Q', expected: 'UMC-8F3K2Q' },
      { input: 'umc-8f3k2q', expected: 'UMC-8F3K2Q' },
      { input: '8f3k2q', expected: 'UMC-8F3K2Q' },
      { input: 'UMC 8F3 K2Q', expected: 'UMC-8F3K2Q' },
      { input: 'UMC-O1LIAB', expected: 'UMC-0111AB' },
      { input: 'UMC-8F3K2', expected: null },
      { input: 'UMC-8F3K2U', expected: null },
      { input: '../../etc', expected: null },
    ])
    .run(({ assert }, { input, expected }) => {
      assert.equal(normalizePublicCode(input), expected)
    })
})
