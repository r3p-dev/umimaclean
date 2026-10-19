import type { MixRow } from '~/lib/reports/period'
import { cn } from '~/lib/shared/utils'

export default function PaymentMixCard({ mix }: { mix: MixRow[] }) {
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-card px-4.5 py-4">
      <h2 className="text-[17px] leading-tight font-bold">Per metode pembayaran</h2>
      <ul className="flex flex-col gap-3">
        {mix.map((row) => (
          <li
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1.5 sm:grid-cols-[150px_minmax(0,1fr)_150px]"
          >
            <span className="flex flex-col gap-0.75">
              <span className="text-sm leading-[1.2] font-semibold">{row.label}</span>
              <span className="text-[10.5px] leading-none font-bold tracking-[0.04em] text-muted-foreground">
                {row.tag}
              </span>
            </span>
            <span className="text-right text-sm leading-none font-semibold tabular-nums sm:col-start-3 sm:row-start-1">
              {row.valueText}
            </span>
            <span
              role="img"
              aria-label={`${row.label} ${row.share}%`}
              className="col-span-full h-2.5 overflow-hidden rounded-xs bg-secondary sm:col-span-1 sm:col-start-2 sm:row-start-1"
            >
              <span
                className={cn(
                  'block h-full rounded-xs',
                  row.store ? 'bg-surface-inverse' : 'bg-primary'
                )}
                style={{ width: `${row.share}%` }}
              />
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
