import type { ComponentType, SVGProps } from 'react'
import { IconChartBar } from '@tabler/icons-react'

// One number with its label, as on the owner's dashboard; the staff queue uses the same card (D107).
// Rendered as a list item: the caller wraps the cards in a <ul>.
export default function StatCard({
  label,
  value,
  icon: Icon = IconChartBar,
}: {
  label: string
  value: string | number
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}) {
  return (
    <li
      data-slot="stat-card"
      className="flex min-w-0 flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5"
    >
      <div className="flex items-center justify-between gap-2 text-muted-foreground">
        <span className="truncate text-sm font-medium">{label}</span>
        <Icon aria-hidden="true" className="size-4.5 shrink-0" />
      </div>
      <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
    </li>
  )
}
