import { type RefObject } from 'react'
import { cn } from '~/lib/shared/utils'

export default function TurnstileWidget({
  container,
  isEnabled,
  className,
}: {
  container: RefObject<HTMLDivElement | null>
  isEnabled: boolean
  className?: string
}) {
  if (!isEnabled) {
    return null
  }
  return <div ref={container} className={cn('min-h-16.25', className)} />
}
