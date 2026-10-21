import { Link } from '@adonisjs/inertia/react'
import { IconRotate } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { LinkButton } from '~/components/ui/button'
import type { OrderRecord } from '~/lib/tracking/orders'
import { orderSummary } from '~/lib/tracking/summary'

export default function RecentOrdersCard({ orders }: { orders: OrderRecord[] }) {
  return (
    <section aria-labelledby="recent-orders-title" className="flex flex-col">
      <div className="flex items-center justify-between px-1 sm:rounded-t-lg sm:border sm:border-b-0 sm:border-border sm:bg-card sm:px-5 sm:py-2">
        <h2 id="recent-orders-title" className="text-base leading-[1.3] font-semibold">
          Terakhir selesai
        </h2>
        <Link
          route="customer.orders.index"
          className="box-content inline-flex min-h-11 items-center py-2 text-sm leading-none font-semibold text-primary hover:text-primary-hover"
        >
          Lihat riwayat
        </Link>
      </div>
      <ul className="flex flex-col gap-3 sm:gap-0 sm:overflow-hidden sm:rounded-b-lg sm:border sm:border-border sm:bg-card">
        {orders.map((order) => {
          const summary = orderSummary(order)
          return (
            <li
              key={order.number}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 sm:rounded-none sm:border-0 sm:border-t sm:px-5 sm:py-3"
            >
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
                <span className="truncate text-[15px] leading-[1.3] font-medium sm:text-sm sm:font-normal">
                  {summary.items}
                  <span className="sm:hidden"> · {summary.total ?? '—'}</span>
                </span>
                <span className="text-right text-sm font-semibold tabular-nums max-sm:hidden">
                  {summary.total ?? '—'}
                </span>
              </div>
              <LinkButton
                href={`${urlFor('customer.order.create')}?ulang=${order.number}`}
                variant="outline"
                size="compact"
                className="shrink-0 gap-1.5 rounded-pill px-3.5 sm:rounded-md"
                aria-label={`Pesan lagi seperti ${order.number}`}
              >
                <IconRotate className="size-4.5" />
                Pesan lagi
              </LinkButton>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
