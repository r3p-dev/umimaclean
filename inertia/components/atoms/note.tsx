import type { ReactNode } from 'react'
import { cn } from 'cn'

// The one map of note tones to Tailwind's palette (CONVENTIONS §9.1); the text always carries the meaning.
// `box` is a tinted panel; `plain` is a coloured line under a field (GUEST-1 area check).
const TONES = {
  attention: { box: 'border-amber-200 bg-amber-50 text-amber-900', plain: 'text-amber-800' },
  success: { box: 'border-green-200 bg-green-50 text-green-900', plain: 'text-green-700' },
  danger: { box: 'border-red-200 bg-red-50 text-red-900', plain: 'text-destructive' },
  info: {
    box: 'border-transparent bg-accent text-accent-foreground',
    plain: 'text-muted-foreground',
  },
}

export default function Note({
  tone,
  variant = 'box',
  icon,
  className,
  children,
}: {
  tone: keyof typeof TONES
  variant?: 'box' | 'plain'
  icon?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <p
      role="note"
      className={cn(
        'flex items-start gap-2 text-sm font-semibold',
        variant === 'box' ? 'rounded-md border px-3 py-2' : 'font-medium',
        TONES[tone][variant],
        className
      )}
    >
      {icon}
      <span>{children}</span>
    </p>
  )
}
