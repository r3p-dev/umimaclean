import { useCallback, useRef } from 'react'
import { searchFirst, searchTerms } from '~/lib/location/geocode'
import type { AddressSuggestion } from '~/lib/location/suggest'
import type { PickupPoint } from '~/lib/order/draft'

export function addressKey(text: string) {
  return searchTerms(text)[0]?.toLowerCase() ?? ''
}

export function useAddressPin(initialKey: string, move: (point: PickupPoint) => void) {
  const placedFor = useRef(initialKey)
  const pending = useRef<Promise<PickupPoint | null> | null>(null)

  const adopt = useCallback((text: string) => {
    placedFor.current = addressKey(text)
    pending.current = null
  }, [])

  const pick = useCallback(
    (suggestion: AddressSuggestion) => {
      placedFor.current = addressKey(suggestion.value)
      pending.current = null
      move(suggestion.point)
    },
    [move]
  )

  const follow = useCallback(
    (text: string, best?: PickupPoint) => {
      const key = addressKey(text)
      if (!key || key === placedFor.current) return pending.current ?? Promise.resolve(null)
      placedFor.current = key
      const task = (best ? Promise.resolve(best) : searchFirst(text).catch(() => null)).then(
        (found) => {
          if (pending.current === task) pending.current = null
          if (!found || placedFor.current !== key) return null
          move(found)
          return found
        }
      )
      pending.current = task
      return task
    },
    [move]
  )

  return { adopt, pick, follow }
}
