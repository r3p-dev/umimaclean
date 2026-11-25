import { cn } from 'cn'
import { OrderStageOf, OrderStatusLabel, STAGE_TONES, type OrderStatus } from '~/lib/order_status'

export default function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus
  className?: string
}) {
  const stage = OrderStageOf[status]
  const tone = STAGE_TONES[stage]

  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        tone.badge,
        className
      )}
    >
      <span aria-hidden="true" className={cn('size-2 rounded-full', tone.dot)} />
      {OrderStatusLabel[status]}
    </span>
  )
}
