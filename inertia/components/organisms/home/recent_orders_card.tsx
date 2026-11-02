import { Link } from '@adonisjs/inertia/react'
import { IconRotate } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { LinkButton } from '~/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { OrderRecord } from '~/lib/tracking/orders'
import { orderSummary } from '~/lib/tracking/summary'

export default function RecentOrdersCard({ orders }: { orders: OrderRecord[] }) {
  return (
    <Card role="region" aria-labelledby="recent-orders-title">
      <CardHeader>
        <CardTitle as="h2" id="recent-orders-title">
          Terakhir selesai
        </CardTitle>
        <CardAction>
          <LinkButton variant="link" href={urlFor('customer.orders.index')}>
            Lihat riwayat
          </LinkButton>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {orders.map((order) => {
            const summary = orderSummary(order)
            return (
              <li key={order.number} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:grid sm:grid-cols-[110px_120px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                  <span className="text-meta leading-none text-muted-foreground sm:text-sm">
                    {summary.date}
                    <span className="sm:hidden"> · {order.number}</span>
                  </span>
                  <Link
                    href={summary.href}
                    className="font-mono text-sm font-semibold text-foreground max-sm:hidden"
                  >
                    {order.number}
                  </Link>
                  <span className="truncate font-medium sm:font-normal">
                    {summary.items}
                    <span className="sm:hidden"> · {summary.total ?? '—'}</span>
                  </span>
                  <span className="text-right font-semibold tabular-nums max-sm:hidden">
                    {summary.total ?? '—'}
                  </span>
                </div>
                <LinkButton
                  href={`${urlFor('customer.order.create')}?ulang=${order.id}`}
                  variant="outline"
                  size="compact"
                  className="shrink-0 gap-1.5"
                  aria-label={`Pesan lagi seperti ${order.number}`}
                >
                  <IconRotate className="size-4.5" />
                  Pesan lagi
                </LinkButton>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
