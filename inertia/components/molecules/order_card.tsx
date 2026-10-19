import { Link } from '@adonisjs/inertia/react'
import StatusBadge from '~/components/atoms/status_badge'
import type { OrderSummary } from '~/lib/tracking/summary'
import { cn } from '~/lib/shared/utils'

export default function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <Link
      href={order.href}
      className={cn(
        'box-content flex min-h-11 flex-col gap-x-6 gap-y-2.5 rounded-lg border bg-card p-4 text-foreground hover:bg-row-hover sm:flex-row sm:items-center',
        order.needsAction ? 'border-attention-border-soft' : 'border-border'
      )}
    >
      <span className="flex flex-1 items-center justify-between gap-3">
        <span className="font-mono text-sm leading-none font-semibold">{order.number}</span>
        <StatusBadge status={order.status} className="px-2.25" />
      </span>
      <span className="flex-1 text-[15px] leading-[1.4] font-medium">{order.items}</span>
      <span className="flex items-center justify-between gap-4 text-note leading-[1.3] text-muted-foreground">
        <span>
          {order.date} · {order.payment}
        </span>
        <span className="text-[15px] leading-none font-bold text-foreground">
          {order.total ?? '—'}
        </span>
      </span>
    </Link>
  )
}
