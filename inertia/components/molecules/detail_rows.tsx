import { cn } from '~/lib/shared/utils'

export type DetailRow = { label: string; value: string; mono?: boolean }

export default function DetailRows({ rows, className }: { rows: DetailRow[]; className?: string }) {
  return (
    <dl className={cn('text-sm leading-[1.4]', className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-4 border-b border-border py-2.75 last:border-b-0"
        >
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className={cn('text-right font-semibold', row.mono && 'font-mono text-[13.5px]')}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
