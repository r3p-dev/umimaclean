import { IconQrcode } from '@tabler/icons-react'
import { urlFor } from '~/client'
import StatusBadge from '~/components/atoms/status_badge'
import PhaseProgress from '~/components/molecules/phase_progress'
import { LinkButton } from '~/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { formatDate } from '~/lib/shared/date'
import type { OrderRecord } from '~/lib/tracking/orders'
import { buildTracking } from '~/lib/tracking/status'

export default function ActiveOrderPanel({ order }: { order: OrderRecord }) {
  const view = buildTracking(order)

  return (
    <Card role="region" aria-labelledby="active-order-title">
      <CardHeader>
        <CardTitle as="h2" id="active-order-title">
          Pesanan aktif
        </CardTitle>
        <CardAction>
          <StatusBadge status={view.status} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-mono text-base leading-none font-semibold">{order.number}</span>
            <span className="text-sm text-foreground-secondary">
              {view.itemsSummary}
              {order.pickupDate && (
                <span className="max-sm:hidden">
                  {' '}
                  · dijemput {formatDate(order.pickupDate, 'short')}
                </span>
              )}
            </span>
          </div>
          {view.total && (
            <span className="text-xl leading-none font-bold tracking-tight tabular-nums sm:text-2xl">
              {view.total}
            </span>
          )}
        </div>
        <PhaseProgress phases={view.phases} tone={view.tone} />
      </CardContent>
      <CardFooter>
        {view.needsPay && (
          <LinkButton
            href={urlFor('customer.orders.pay', { id: order.id })}
            size="desktop"
            className="gap-2 px-4 max-sm:h-btn max-sm:w-full"
          >
            <IconQrcode className="size-5" />
            Bayar dengan QRIS
          </LinkButton>
        )}
        <LinkButton
          href={urlFor('customer.orders.show', { id: order.id })}
          variant="outline"
          size="desktop"
          className="px-4 max-sm:h-btn max-sm:w-full"
        >
          Lihat detail
        </LinkButton>
      </CardFooter>
    </Card>
  )
}
