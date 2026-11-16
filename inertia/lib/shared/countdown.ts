import { useEffect, useState } from 'react'

export function useResendTimer(initialSeconds: number) {
  const [prevInitial, setPrevInitial] = useState(initialSeconds)
  const [remaining, setRemaining] = useState(initialSeconds)

  if (prevInitial !== initialSeconds) {
    setPrevInitial(initialSeconds)
    setRemaining(initialSeconds)
  }

  useEffect(() => {
    if (remaining <= 0) {
      return
    }

    const interval = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          clearInterval(interval)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [remaining])

  return { remaining }
}
