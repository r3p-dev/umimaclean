import { randomInt } from 'node:crypto'

export const PUBLIC_CODE_PREFIX = 'UMC-'
export const PUBLIC_CODE_LENGTH = 6
export const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

const CODE_PATTERN = new RegExp(`^[${CROCKFORD_ALPHABET}]{${PUBLIC_CODE_LENGTH}}$`)

export function newPublicCode() {
  return (
    PUBLIC_CODE_PREFIX +
    Array.from(
      { length: PUBLIC_CODE_LENGTH },
      () => CROCKFORD_ALPHABET[randomInt(CROCKFORD_ALPHABET.length)]
    ).join('')
  )
}

export function normalizePublicCode(value: string) {
  let code = value.toUpperCase().replace(/[\s-]/g, '')
  if (code.startsWith('UMC')) {
    code = code.slice(3)
  }
  code = code.replaceAll('O', '0').replace(/[IL]/g, '1')
  return CODE_PATTERN.test(code) ? PUBLIC_CODE_PREFIX + code : null
}
