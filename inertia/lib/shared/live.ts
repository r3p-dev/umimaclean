import { useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Transmit } from '@adonisjs/transmit-client'

let client: Transmit | null = null

export function useLiveReload(channel: string | null, only?: string[]) {
  const keys = only?.join(',')

  useEffect(() => {
    if (!channel) {
      return
    }
    client ??= new Transmit({ baseUrl: window.location.origin })
    const subscription = client.subscription(channel)
    let isActive = true
    let stop: (() => void) | null = null

    subscription
      .create()
      .then(() => {
        if (isActive) {
          stop = subscription.onMessage(() => router.reload(keys ? { only: keys.split(',') } : {}))
        }
      })
      .catch(() => {})

    return () => {
      isActive = false
      stop?.()
      void subscription.delete().catch(() => {})
    }
  }, [channel, keys])
}
