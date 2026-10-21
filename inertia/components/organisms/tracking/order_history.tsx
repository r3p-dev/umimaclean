import { Link } from '@adonisjs/inertia/react'
import StatusBadge from '~/components/atoms/status_badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import type { OrderSummary } from '~/lib/tracking/summary'
import { cn } from '~/lib/shared/utils'

function OrderHistoryCard({ order }: { order: OrderSummary }) {
  return (
    <li>
      <Link
        href={order.href}
        className={cn(
          'flex flex-col gap-1.5 rounded-lg border bg-card p-4 text-foreground no-underline hover:bg-row-hover hover:text-foreground hover:no-underline',
          order.needsAction ? 'border-attention-border-soft' : 'border-border'
        )}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="text-meta leading-none text-muted-foreground">{order.date}</span>
          <StatusBadge status={order.status} />
        </span>
        <span className="font-mono text-sm leading-none font-semibold">{order.number}</span>
        <span className="flex items-end justify-between gap-3">
          <span className="text-sm leading-[1.4] text-foreground-secondary">{order.items}</span>
          <span className="text-base leading-none font-bold tabular-nums">
            {order.total ?? '—'}
          </span>
        </span>
      </Link>
    </li>
  )
}

export function OrderHistoryCards({ orders }: { orders: OrderSummary[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {orders.map((order) => (
        <OrderHistoryCard key={order.number} order={order} />
      ))}
    </ul>
  )
}

export function OrderHistoryTable({ orders }: { orders: OrderSummary[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>No. pesanan</TableHead>
            <TableHead>Barang</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.number}>
              <TableCell className="text-foreground-secondary">{order.date}</TableCell>
              <TableCell>
                <Link
                  href={order.href}
                  className="inline-flex min-h-11 items-center font-mono text-sm leading-none font-semibold text-primary hover:text-primary-hover hover:underline"
                >
                  {order.number}
                </Link>
              </TableCell>
              <TableCell>{order.items}</TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell
                className={cn(
                  'text-right tabular-nums',
                  order.total ? 'font-semibold' : 'text-muted-foreground'
                )}
              >
                {order.total ?? '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
