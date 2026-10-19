import { Link } from '@adonisjs/inertia/react'
import OrderHistoryItem from '~/components/molecules/order_history_item'
import OrderResultBadge from '~/components/molecules/order_result_badge'
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

export default function OrderHistory({ orders }: { orders: OrderSummary[] }) {
  return (
    <>
      <div className="rounded-lg border border-border bg-card sm:hidden">
        {orders.map((order) => (
          <OrderHistoryItem key={order.number} order={order} />
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card max-sm:hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>No. pesanan</TableHead>
              <TableHead>Barang</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pembayaran</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.number}>
                <TableCell>{order.date}</TableCell>
                <TableCell>
                  <Link
                    href={order.href}
                    className="font-mono text-meta leading-none font-medium text-primary hover:text-primary-hover hover:underline"
                  >
                    {order.number}
                  </Link>
                </TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell
                  className={cn(
                    'text-right',
                    order.total ? 'font-semibold' : 'text-muted-foreground'
                  )}
                >
                  {order.total ?? '—'}
                </TableCell>
                <TableCell>
                  <OrderResultBadge cancelled={order.cancelled} />
                </TableCell>
                <TableCell
                  className={order.paid ? 'text-success-foreground' : 'text-muted-foreground'}
                >
                  {order.payment}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
