import { useCallback, useEffect, useState } from 'react'

export function useCountdown(endsAt: number | null) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (endsAt === null) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [endsAt])

  return endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000))
}

export function useResendTimer(seconds: number) {
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000)
  const remaining = useCountdown(endsAt)
  const restart = useCallback(() => setEndsAt(Date.now() + seconds * 1000), [seconds])
  return { remaining, restart }
}
