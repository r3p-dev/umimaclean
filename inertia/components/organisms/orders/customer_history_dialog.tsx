import { Link } from '@adonisjs/inertia/react'
import { urlFor } from '~/client'
import { LinkButton } from '~/components/ui/button'
import { Dialog, DialogClose, DialogDescription } from '~/components/ui/dialog'
import ToneBadge from '~/components/atoms/tone_badge'
import DialogTitleBar from '~/components/molecules/dialog_title_bar'
import type { AdminOrder } from '~/lib/orders/admin_orders'
import { formatDayMonth } from '~/lib/shared/date'
import { formatRupiah } from '~/lib/shared/format'

export default function CustomerHistoryDialog({
  isOpen,
  onOpenChange,
  customer,
  summary,
  orders,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  customer: string
  summary: string
  orders: AdminOrder[]
}) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} variant="panel">
      <DialogTitleBar>Riwayat {customer}</DialogTitleBar>
      <DialogDescription className="text-note leading-normal">{summary}</DialogDescription>
      <ul className="flex flex-col overflow-hidden rounded-md border border-border">
        {orders.map((order) => (
          <li
            key={order.number}
            className="flex flex-wrap items-center gap-2.5 border-t border-border px-3.5 py-3 first:border-t-0"
          >
            <Link
              href={urlFor('admin.order', { number: order.number })}
              onClick={() => onOpenChange(false)}
              className="font-mono text-meta leading-none font-semibold text-foreground"
            >
              {order.number}
            </Link>
            <ToneBadge tone={order.phase}>{order.status}</ToneBadge>
            <span className="flex-1" />
            <span className="text-meta leading-none text-muted-foreground">
              {formatDayMonth(order.date, true)}
            </span>
            <span className="text-sm leading-none font-semibold tabular-nums">
              {formatRupiah(order.total)}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row sm:items-center">
        <DialogClose variant="outline" size="desktop">
          Tutup
        </DialogClose>
        <LinkButton size="desktop" href={urlFor('admin.orders')}>
          Buka daftar pesanan
        </LinkButton>
      </div>
    </Dialog>
  )
}
