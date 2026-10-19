import { IconArrowDown, IconArrowUp, IconMinus } from '@tabler/icons-react'
import type { Delta } from '~/lib/reports/period'
import { cn } from '~/lib/shared/utils'

export default function MetricCard({
  label,
  value,
  delta,
  note,
}: {
  label: string
  value: string
  delta?: Delta
  note?: string
}) {
  const Icon =
    !delta || delta.trend === 'none'
      ? IconMinus
      : delta.trend === 'up'
        ? IconArrowUp
        : IconArrowDown

  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card px-4.5 py-4">
      <span className="text-meta leading-[1.3] font-semibold text-foreground-secondary">
        {label}
      </span>
      <span className="text-[26px] leading-[1.1] font-bold tracking-[-0.015em] tabular-nums">
        {value}
      </span>
      {delta && (
        <span
          className={cn(
            'flex flex-wrap items-center gap-1 text-meta leading-[1.3] font-semibold',
            delta.trend === 'up' && 'text-success-foreground',
            delta.trend === 'down' && 'text-destructive-text',
            delta.trend === 'none' && 'font-normal text-foreground-secondary'
          )}
        >
          <Icon className="size-4" />
          {delta.text} <span className="font-normal text-muted-foreground">{delta.sub}</span>
        </span>
      )}
      {note && <span className="text-meta leading-[1.3] text-muted-foreground">{note}</span>}
    </div>
  )
}
