import { IconCircleCheck, IconCircleDot, IconCircleX } from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { cn } from 'cn'
import { OrderStatusLabel, formatDateTimeId } from '~/lib/order_status'

type TimelineEvent = Data.OrderDetail['events'][number]

export default function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {events.map((event, index) => {
        const isLast = index === events.length - 1
        const isCancelled = event.status === 'cancelled'
        const Icon = isLast ? (isCancelled ? IconCircleX : IconCircleDot) : IconCircleCheck

        return (
          <li
            key={event.id}
            aria-current={isLast ? 'step' : undefined}
            className="flex items-start gap-3"
          >
            <Icon
              aria-hidden="true"
              className={cn(
                'mt-0.5 size-5 shrink-0',
                isLast ? (isCancelled ? 'text-destructive' : 'text-primary') : 'text-emerald-600'
              )}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className={cn('text-sm', isLast ? 'font-semibold' : 'font-medium')}>
                  {OrderStatusLabel[event.status]}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatDateTimeId(event.createdAt)}
                </span>
              </div>
              {event.note && <p className="text-sm text-muted-foreground">Catatan: {event.note}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
