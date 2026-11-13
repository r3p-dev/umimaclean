import type { ReactNode } from 'react'
import { cn } from 'cn'

// The one map of note tones to Tailwind's palette (CONVENTIONS §9.1); the text always carries the meaning.
const TONES = {
  attention: 'border-amber-200 bg-amber-50 text-amber-900',
  success: 'border-green-200 bg-green-50 text-green-900',
  info: 'border-transparent bg-accent text-accent-foreground',
}

export default function Note({
  tone,
  icon,
  className,
  children,
}: {
  tone: keyof typeof TONES
  icon?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <p
      role="note"
      className={cn(
        'flex items-start gap-2 rounded-md border px-3 py-2 text-sm font-semibold',
        TONES[tone],
        className
      )}
    >
      {icon}
      <span>{children}</span>
    </p>
  )
}
