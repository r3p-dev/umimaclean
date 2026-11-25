import { useState, type ReactNode } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconArrowDownLeft,
  IconArrowLeft,
  IconArrowUpRight,
  IconBan,
  IconBrandWhatsapp,
  IconRefresh,
} from '@tabler/icons-react'
import type { Data } from '@generated/data'
import Note from '~/components/atoms/note'
import OrderStatusBadge from '~/components/atoms/order_status_badge'
import OrderStageProgress from '~/components/molecules/order_stage_progress'
import OrderCancelDialog from '~/components/organisms/order_cancel_dialog'
import OrderTimeline from '~/components/organisms/order_timeline'
import CustomerLayout from '~/components/templates/customer_layout'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { bagSizeLabel, formatPickupDate, formatSlotTime } from '~/lib/order_format'
import { formatCreatedDateId, whatsappOrderLink } from '~/lib/order_status'

export default function CustomerOrderShow({ order }: { order: Data.OrderDetail }) {
  const store = usePage().props.store
  const [isCancelOpen, setCancelOpen] = useState(false)

  const pickup = order.addresses.find((address) => address.kind === 'pickup')
  const delivery = order.addresses.find((address) => address.kind === 'delivery')
  const isFinished = order.status === 'completed' || order.status === 'cancelled'
  const waHref = whatsappOrderLink(store.whatsapp, store.name, order.number)

  return (
    <div className="mx-auto max-w-6xl px-5 pt-4 lg:pt-8">
      <Head title={order.number} />

      <Link
        route="customer.orders.index"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft aria-hidden="true" className="size-4" />
        Riwayat
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="font-mono text-2xl font-bold tracking-tight lg:text-3xl">{order.number}</h1>
        <OrderStatusBadge status={order.status} />
        <span className="text-sm text-muted-foreground">
          dibuat {formatCreatedDateId(order.createdAt)}
        </span>
      </div>

      <div className="mt-4">
        <OrderStageProgress status={order.status} />
      </div>

      <div className="mt-5 grid grid-cols-1 items-start gap-4 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <div className="flex flex-col gap-4 max-lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Barang &amp; layanan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ul className="divide-y divide-border">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col">
                      <span className="text-base font-medium">
                        {item.brand ? `${item.brand} · ${item.type}` : item.type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.itemKind === 'shoe'
                          ? `Sepatu · EU ${item.size}`
                          : `Tas · ${bagSizeLabel(item.size)}`}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">
                {order.status === 'cancelled'
                  ? 'Pesanan dibatalkan. Tidak ada tagihan.'
                  : 'Layanan dan harga ditentukan tim kami setelah barang diperiksa.'}
              </p>
              {order.note && (
                <Note tone="info" className="font-normal">
                  Catatan: {order.note}
                </Note>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {pickup && (
              <Card>
                <CardContent className="flex items-start gap-3 pt-6">
                  <IconArrowUpRight
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold">Dijemput dari {pickup.label}</span>
                    <span className="text-sm text-muted-foreground">{pickup.addressText}</span>
                    <span className="text-sm text-muted-foreground">
                      Kec. {pickup.kecamatan}, {pickup.city}
                    </span>
                    <span className="text-sm font-medium">
                      {formatPickupDate(order.pickupDate, 'full')},{' '}
                      {formatSlotTime(order.pickupStartsAt, order.pickupEndsAt)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Kontak: {pickup.recipientName} · {pickup.recipientPhone}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
            {delivery && (
              <Card>
                <CardContent className="flex items-start gap-3 pt-6">
                  <IconArrowDownLeft
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold">Diantar ke {delivery.label}</span>
                    <span className="text-sm text-muted-foreground">{delivery.addressText}</span>
                    <span className="text-sm text-muted-foreground">
                      Kec. {delivery.kecamatan}, {delivery.city}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Penerima: {delivery.recipientName} · {delivery.recipientPhone}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-4 max-lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline events={order.events} />
            </CardContent>
          </Card>

          <Link
            href={`/pesan?ulang=${order.id}`}
            className={buttonVariants({
              variant: 'outline',
              className: 'min-h-11 gap-2 text-base',
            })}
          >
            <IconRefresh aria-hidden="true" className="size-5" />
            Pesan lagi
          </Link>

          {order.canCancel && (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 gap-2 border-destructive/40 text-base text-destructive hover:bg-destructive/10"
              onPress={() => setCancelOpen(true)}
            >
              <IconBan aria-hidden="true" className="size-5" />
              Batalkan Pesanan
            </Button>
          )}

          {!order.canCancel && !isFinished && (
            <Note tone="info" className="font-normal">
              Ingin membatalkan atau ubah jadwal?{' '}
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary underline underline-offset-4"
              >
                Hubungi kami di WhatsApp
              </a>
              .
            </Note>
          )}

          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <IconBrandWhatsapp aria-hidden="true" className="size-5" />
            Butuh bantuan? Chat via WhatsApp
          </a>
        </aside>
      </div>

      <OrderCancelDialog
        orderId={order.id}
        orderNumber={order.number}
        isOpen={isCancelOpen}
        onOpenChange={setCancelOpen}
      />
    </div>
  )
}

CustomerOrderShow.layout = (page: ReactNode) => (
  <CustomerLayout active="riwayat">{page}</CustomerLayout>
)
