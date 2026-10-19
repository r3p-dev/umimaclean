import type { Day, MixRow } from '~/lib/reports/period'
import { revenueAxis } from '~/lib/reports/period'
import { formatDayMonth, isWeekend } from '~/lib/shared/date'
import { formatRupiah } from '~/lib/shared/format'
import { cn } from '~/lib/shared/utils'

export default function RevenueChart({
  days,
  mix,
  label,
}: {
  days: Day[]
  mix: MixRow[]
  label: string
}) {
  const axis = revenueAxis(days)

  return (
    <section className="flex min-w-0 flex-col gap-3.5 rounded-lg border border-border bg-card px-5 py-4.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base leading-none font-semibold">Omzet harian</h2>
        <span className="flex gap-3.5 text-caption leading-none font-medium text-foreground-secondary">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-xs bg-primary" />
            Hari kerja
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-xs bg-chart-2" />
            Sabtu–Minggu
          </span>
        </span>
      </div>
      <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-2">
        <div
          aria-hidden="true"
          className="flex h-50 flex-col justify-between text-right font-mono text-2xs leading-none font-medium text-muted-foreground"
        >
          {axis.yTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div className="relative h-50 border-b border-border-strong bg-[linear-gradient(var(--secondary)_1px,transparent_1px)] bg-size-[100%_66.66px]">
          <div
            role="img"
            aria-label={label}
            className="absolute inset-0 flex items-end gap-[clamp(1px,0.4vw,4px)] px-0.5"
          >
            {days.map((day) => (
              <div
                key={day.date.getTime()}
                title={`${formatDayMonth(day.date)} · ${formatRupiah(day.revenue)} · ${day.transactions} transaksi`}
                className={cn(
                  'min-w-0 flex-1 rounded-t-xs',
                  isWeekend(day.date) ? 'bg-chart-2' : 'bg-primary'
                )}
                style={{ height: `${Math.max(1, (day.revenue / axis.top) * 100)}%` }}
              />
            ))}
          </div>
        </div>
        <span />
        <div
          aria-hidden="true"
          className="flex justify-between font-mono text-2xs leading-none font-medium text-muted-foreground"
        >
          {axis.xTicks.map((tick, index) => (
            <span key={`${tick}-${index}`}>{tick}</span>
          ))}
        </div>
      </div>
      <dl className="grid grid-cols-1 gap-3 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-4">
        {mix.map((row) => (
          <div key={row.label}>
            <dt className="text-caption leading-[1.3] font-medium text-muted-foreground">
              {row.label}
            </dt>
            <dd className="text-[15px] leading-[1.4] font-semibold">{row.valueText}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
