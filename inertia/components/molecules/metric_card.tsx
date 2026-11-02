import { IconArrowDown, IconArrowUp, IconMinus } from '@tabler/icons-react'
import { Card, CardContent } from '~/components/ui/card'
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
    <Card>
      <CardContent>
        <div className="flex flex-col gap-2">
          <span className="text-meta font-semibold text-foreground-secondary">{label}</span>
          <span className="text-2xl leading-none font-bold tracking-tight tabular-nums">
            {value}
          </span>
          {delta && (
            <span
              className={cn(
                'flex flex-wrap items-center gap-1 text-meta font-semibold',
                delta.trend === 'up' && 'text-success-foreground',
                delta.trend === 'down' && 'text-destructive-text',
                delta.trend === 'none' && 'font-normal text-foreground-secondary'
              )}
            >
              <Icon className="size-4" />
              {delta.text} <span className="font-normal text-muted-foreground">{delta.sub}</span>
            </span>
          )}
          {note && <span className="text-meta text-muted-foreground">{note}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
