import { type ReactNode } from 'react'
import { cn } from '~/lib/shared/utils'

export default function FlowFooter({
  className,
  innerClassName,
  children,
}: {
  className?: string
  innerClassName?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <div
        className={cn(
          'mx-auto box-content flex max-w-page items-center gap-2.5 px-5 pt-4 pb-6 sm:justify-between',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}
