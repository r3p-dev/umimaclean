import { Link } from '@adonisjs/inertia/react'
import OrderResultBadge from '~/components/molecules/order_result_badge'
import type { OrderSummary } from '~/lib/tracking/summary'
import { cn } from '~/lib/shared/utils'

export default function OrderHistoryItem({ order }: { order: OrderSummary }) {
  return (
    <Link
      href={order.href}
      className="box-content flex min-h-11 flex-col gap-1.5 border-b border-border px-4 py-3.5 text-foreground last:border-b-0 hover:bg-row-hover"
    >
      <span className="flex items-center justify-between">
        <span className="text-note leading-none font-medium text-muted-foreground">
          {order.date} · <span className="font-mono">{order.number}</span>
        </span>
        <OrderResultBadge cancelled={order.cancelled} />
      </span>
      <span className="flex items-baseline justify-between">
        <span className="text-[15px] leading-[1.35] font-medium">{order.items}</span>
        <span
          className={cn(
            'text-[15px] leading-none font-semibold',
            !order.total && 'text-muted-foreground'
          )}
        >
          {order.total ?? '—'}
        </span>
      </span>
      <span
        className={cn(
          'text-meta leading-none',
          order.paid ? 'text-success-foreground' : 'text-muted-foreground'
        )}
      >
        {order.payment}
      </span>
    </Link>
  )
}
