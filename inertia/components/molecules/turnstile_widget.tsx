import type { RefObject } from 'react'
import { cn } from 'cn'

export default function TurnstileWidget({
  container,
  token,
  isEnabled,
  className,
}: {
  container: RefObject<HTMLDivElement | null>
  token?: string
  isEnabled: boolean
  className?: string
}) {
  if (!isEnabled) {
    return null
  }

  return (
    <div className={cn('min-h-16', className)}>
      <div ref={container} />
      {token && <input type="hidden" name="turnstile" value={token} />}
    </div>
  )
}
