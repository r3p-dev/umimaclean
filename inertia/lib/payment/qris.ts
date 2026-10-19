import { useCallback, useState } from 'react'
import { useCountdown } from '~/lib/shared/countdown'
import { readStore, writeStore } from '~/lib/shared/storage'

const VALID_MINUTES = 15

function sessionKey(orderNumber: string) {
  return `umima:qris:${orderNumber}`
}

function freshExpiry(orderNumber: string) {
  const expiresAt = Date.now() + VALID_MINUTES * 60 * 1000
  writeStore('session', sessionKey(orderNumber), expiresAt)
  return expiresAt
}

export function useQrisSession(orderNumber: string) {
  const [expiresAt, setExpiresAt] = useState(
    () => readStore<number>('session', sessionKey(orderNumber)) ?? freshExpiry(orderNumber)
  )
  const remaining = useCountdown(expiresAt)
  const renew = useCallback(() => setExpiresAt(freshExpiry(orderNumber)), [orderNumber])
  return { remaining, expired: remaining === 0, renew }
}
