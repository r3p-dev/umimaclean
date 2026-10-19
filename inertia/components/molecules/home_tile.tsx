import { type ComponentType, type SVGProps } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { TONE_CLASSES } from '~/components/atoms/status_tone'
import type { StatusTone } from '~/lib/tracking/status'
import { cn } from '~/lib/shared/utils'

export default function HomeTile({
  href,
  icon: Icon,
  tone,
  count,
  label,
  sub,
}: {
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  tone: StatusTone
  count: number
  label: string
  sub: string
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card p-3.5 text-foreground no-underline hover:border-primary hover:bg-accent hover:text-foreground hover:no-underline"
    >
      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-md',
          TONE_CLASSES[tone].surface,
          TONE_CLASSES[tone].ink
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="text-[26px] leading-none font-bold">{count}</span>
      <span className="text-sm leading-[1.2] font-semibold">{label}</span>
      <span className="text-caption leading-[1.3] text-muted-foreground">{sub}</span>
    </Link>
  )
}
