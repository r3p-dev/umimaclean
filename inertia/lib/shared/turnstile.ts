import { useCallback, useEffect, useRef, useState } from 'react'
import { usePage } from '@inertiajs/react'

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string
  reset: (widget: string) => void
  remove: (widget: string) => void
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let loader: Promise<TurnstileApi> | null = null

function loadTurnstile() {
  loader ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT
    script.async = true
    script.onload = () => {
      const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile
      if (api) {
        resolve(api)
      } else {
        reject(new Error('Turnstile unavailable'))
      }
    }
    script.onerror = () => {
      loader = null
      reject(new Error('Turnstile failed to load'))
    }
    document.head.append(script)
  })
  return loader
}

export function useTurnstile() {
  const siteKey = usePage().props.turnstileSiteKey
  const container = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const api = useRef<TurnstileApi | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if (!siteKey) {
      return
    }
    let isActive = true
    loadTurnstile()
      .then((turnstile) => {
        if (!isActive || !container.current) {
          return
        }
        api.current = turnstile
        widget.current = turnstile.render(container.current, {
          'sitekey': siteKey,
          'language': 'id',
          'callback': setToken,
          'expired-callback': () => setToken(null),
        })
      })
      .catch(() => {})
    return () => {
      isActive = false
      if (widget.current) {
        api.current?.remove(widget.current)
      }
      widget.current = null
    }
  }, [siteKey])

  const reset = useCallback(() => {
    setToken(null)
    if (widget.current) {
      api.current?.reset(widget.current)
    }
  }, [])

  return { isEnabled: !!siteKey, container, token: token ?? undefined, reset }
}
