import { useCallback, useEffect, useRef, useState } from 'react'
import { usePage } from '@inertiajs/react'

interface TurnstileApi {
  render: (element: HTMLElement, options: Record<string, unknown>) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let scriptPromise: Promise<TurnstileApi> | null = null

function loadTurnstileScript(): Promise<TurnstileApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cannot load Turnstile on server'))
  }

  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }

  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`)
    if (existing) {
      if (window.turnstile) {
        resolve(window.turnstile)
        return
      }
    }

    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => {
      if (window.turnstile) {
        resolve(window.turnstile)
      } else {
        reject(new Error('Turnstile API unavailable after load'))
      }
    }
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Turnstile script failed to load'))
    }
    document.head.append(script)
  })

  return scriptPromise
}

export function useTurnstile() {
  const page = usePage<{ turnstileSiteKey?: string }>()
  const siteKey = page.props.turnstileSiteKey
  const container = useRef<HTMLDivElement | null>(null)
  const widgetId = useRef<string | null>(null)
  const api = useRef<TurnstileApi | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if (!siteKey) {
      return
    }

    let isMounted = true
    loadTurnstileScript()
      .then((turnstile) => {
        if (!isMounted || !container.current) {
          return
        }
        api.current = turnstile
        widgetId.current = turnstile.render(container.current, {
          'sitekey': siteKey,
          'language': 'id',
          'response-field-name': 'turnstile',
          'callback': (newToken: string) => {
            if (isMounted) {
              setToken(newToken)
            }
          },
          'expired-callback': () => {
            if (isMounted) {
              setToken(null)
            }
          },
        })
      })
      .catch(() => {})

    return () => {
      isMounted = false
      if (widgetId.current && api.current) {
        api.current.remove(widgetId.current)
      }
      widgetId.current = null
    }
  }, [siteKey])

  const reset = useCallback(() => {
    setToken(null)
    if (widgetId.current && api.current) {
      api.current.reset(widgetId.current)
    }
  }, [])

  return {
    isEnabled: Boolean(siteKey),
    container,
    token: token ?? undefined,
    reset,
  }
}
