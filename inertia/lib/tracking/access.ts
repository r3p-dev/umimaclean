import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { urlFor } from '~/client'
import { findOrder } from '~/lib/tracking/orders'
import { verifiedPhone } from '~/lib/verification/session'

export function useVerifiedPhone() {
  const [phone] = useState(verifiedPhone)

  useEffect(() => {
    if (!phone) router.visit(urlFor('tracking.sign_in'), { replace: true })
  }, [phone])

  return phone
}

export function useOrderAccess(number: string) {
  const [state] = useState(() => {
    const order = findOrder(number)
    return { order, allowed: !!order && verifiedPhone() === order.phone }
  })

  useEffect(() => {
    if (state.order && !state.allowed) {
      router.visit(urlFor('tracking.sign_in'), { replace: true })
    }
  }, [state])

  return state
}
