import { type ElementType, type ReactNode } from 'react'
import { cn } from '~/lib/shared/utils'

export default function Overline({
  as: Tag = 'span',
  id,
  className,
  children,
}: {
  as?: ElementType
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <Tag
      id={id}
      className={cn(
        'text-meta leading-none font-semibold tracking-[0.06em] text-muted-foreground uppercase',
        className
      )}
    >
      {children}
    </Tag>
  )
}
