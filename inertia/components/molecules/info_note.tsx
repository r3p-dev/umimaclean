import { type ComponentType, type ReactNode, type SVGProps } from 'react'
import { cn } from '~/lib/shared/utils'

const TONES = {
  plain: 'text-muted-foreground',
  muted: 'rounded-md bg-background p-3.5 text-foreground-secondary',
  accent: 'rounded-md bg-accent px-3.5 py-3 text-accent-foreground',
}

const SIZES = {
  default: { text: 'gap-2.5 text-note leading-normal', icon: 'my-[1.8px] size-4.5' },
  sm: { text: 'gap-2 text-meta leading-[1.45]', icon: 'size-4.25' },
}

export default function InfoNote({
  icon: Icon,
  tone = 'muted',
  size = 'default',
  className,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  tone?: keyof typeof TONES
  size?: keyof typeof SIZES
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('flex items-start', SIZES[size].text, TONES[tone], className)}>
      <Icon className={cn('shrink-0', SIZES[size].icon)} />
      <span>{children}</span>
    </div>
  )
}
