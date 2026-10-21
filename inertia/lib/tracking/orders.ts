import type { Data } from '@generated/data'

export type OrderRecord = Data.Order

export function newOrderNumber() {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return 'UMC-' + Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}
