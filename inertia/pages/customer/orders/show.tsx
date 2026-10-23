import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconCircle,
  IconCircleCheck,
  IconCircleDot,
  IconCircleX,
  IconBan,
  IconMessage,
  IconQrcode,
  IconReceipt,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import Overline from '~/components/atoms/overline'
import StatusBadge from '~/components/atoms/status_badge'
import BackLink from '~/components/molecules/back_link'
import AccountLayout from '~/components/templates/account_layout'
import { Button, LinkButton } from '~/components/ui/button'
import { CancelDialog } from '~/components/organisms/orders/bulk_order_dialogs'
import { shortStreet } from '~/lib/order/addresses'
import { billRows } from '~/lib/payment/bill'
import { formatDate } from '~/lib/shared/date'
import type { OrderRecord } from '~/lib/tracking/orders'
import { buildTracking, CANCELLED, COMPLETED } from '~/lib/tracking/status'
import { helpLink, orderTimeline } from '~/lib/tracking/timeline'
import { useLiveReload } from '~/lib/shared/live'
import { cn } from '~/lib/shared/utils'

const CUSTOMER_CANCEL_REASONS = [
  'Salah jadwal',
  'Barang batal dicuci',
  'Ingin antar sendiri ke toko',
  'Lainnya',
]

export default function OrderDetail({ order, isOwner }: { order: OrderRecord; isOwner: boolean }) {
  useLiveReload(`orders/${order.id}`, ['order'])
  const [isCancelling, setCancelling] = useState(false)
  const view = buildTracking(order)
  const timeline = orderTimeline(order)
  const rows = order.bill && view.servicesKnown ? billRows(order.bill) : null
  const pickup = order.pickupAddress
  const delivery = order.deliveryAddress

  const payCard = view.total && !view.cancelled && (
    <section className="flex flex-col gap-3.5 rounded-lg border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-foreground-secondary">Total tagihan</span>
        <span className="text-[26px] leading-none font-bold tracking-[-0.01em] tabular-nums">
          {view.total}
        </span>
      </div>
      {view.needsPay && isOwner ? (
        <LinkButton
          href={urlFor('customer.orders.pay', { id: order.id })}
          size="cta"
          className="gap-2"
        >
          <IconQrcode className="size-5.5" />
          Bayar dengan QRIS
        </LinkButton>
      ) : view.needsPay ? null : (
        <p className="text-sm leading-[1.4] text-success-foreground">{view.payment.label}</p>
      )}
      <LinkButton
        href={urlFor('customer.orders.bill', { id: order.id })}
        variant="link"
        className="self-start"
      >
        Lihat rincian tagihan
      </LinkButton>
    </section>
  )

  return (
    <>
      <Head title={order.number} />
      <div className="mx-auto box-content max-w-page px-5 pt-4 lg:pt-8">
        <BackLink href={urlFor('customer.orders.index')} label="Riwayat" />
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="font-mono text-[28px] leading-none font-semibold tracking-[-0.01em] lg:text-[34px]">
            {order.number}
          </h1>
          <StatusBadge status={view.status} size="lg" />
          <span className="text-sm text-foreground-secondary">
            dibuat {formatDate(order.createdOn, 'full')}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
          <div className="flex flex-col gap-4 max-lg:order-2">
            <section
              aria-labelledby="items-title"
              className="flex flex-col rounded-lg border border-border bg-card px-5 pt-4 pb-4"
            >
              <Overline as="h2" id="items-title">
                Barang & layanan
              </Overline>
              {rows ? (
                <>
                  <ul className="mt-1 flex flex-col">
                    {rows.map((row, index) => (
                      <li
                        key={`${row.name}-${index}`}
                        className="flex items-start justify-between gap-4 border-b border-border py-3"
                      >
                        <span className="flex flex-col gap-1">
                          <span className="text-[15px] leading-[1.3] font-medium">{row.name}</span>
                          <span className="text-meta leading-[1.4] text-foreground-secondary">
                            {row.services.map((service) => service.name).join(' + ')}
                          </span>
                        </span>
                        <span className="text-[15px] leading-[1.3] font-medium tabular-nums">
                          {row.subtotal}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="flex items-center justify-between pt-3 text-lg leading-none font-bold">
                    <span>Total</span>
                    <span className="tabular-nums">{view.total}</span>
                  </p>
                </>
              ) : (
                <div className="mt-2 flex flex-col gap-1">
                  <p className="text-[15px] leading-[1.4] font-medium">{view.itemsSummary}</p>
                  <p className="text-sm leading-[1.45] text-foreground-secondary">
                    {view.cancelled
                      ? 'Pesanan dibatalkan. Tidak ada tagihan.'
                      : 'Layanan dan harga ditentukan tim kami setelah barang diperiksa.'}
                  </p>
                </div>
              )}
              {order.note && (
                <p className="mt-3 rounded-md bg-muted px-3 py-2.5 text-sm leading-[1.4] text-foreground-secondary">
                  Catatan: {order.note}
                </p>
              )}
            </section>
            <div className="grid gap-4 sm:grid-cols-2">
              <section className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <IconArrowUpRight className="mt-px size-5 shrink-0 text-foreground-secondary" />
                <span className="flex flex-col gap-1">
                  <span className="text-[15px] leading-[1.3] font-semibold">
                    {pickup ? `Dijemput dari ${pickup.label}` : 'Diterima di toko'}
                  </span>
                  <span className="text-sm leading-[1.4] text-foreground-secondary">
                    {pickup ? shortStreet(pickup.addressText) : 'Barang dibawa langsung ke toko'}
                  </span>
                </span>
              </section>
              <section className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <IconArrowDownLeft className="mt-px size-5 shrink-0 text-foreground-secondary" />
                <span className="flex flex-col gap-1">
                  <span className="text-[15px] leading-[1.3] font-semibold">
                    {order.returnMethod === 'store'
                      ? 'Diambil di toko'
                      : `Diantar ke ${(delivery ?? pickup)?.label ?? 'alamat Anda'}`}
                  </span>
                  <span className="text-sm leading-[1.4] text-foreground-secondary">
                    {order.returnMethod === 'store'
                      ? 'Ambil di toko setelah selesai dicuci'
                      : delivery
                        ? shortStreet(delivery.addressText)
                        : 'Ke alamat yang sama'}
                  </span>
                </span>
              </section>
            </div>
          </div>
          <aside className="flex flex-col gap-4 max-lg:order-1">
            {payCard}
            <section
              aria-labelledby="status-title"
              className="flex flex-col rounded-lg border border-border bg-card px-5 pt-4 pb-3"
            >
              <Overline as="h2" id="status-title">
                Status
              </Overline>
              <ol className="mt-1 flex flex-col">
                {timeline.map((step) => {
                  const Icon =
                    step.state === 'done'
                      ? IconCircleCheck
                      : step.state === 'current'
                        ? order.status === CANCELLED
                          ? IconCircleX
                          : IconCircleDot
                        : IconCircle
                  return (
                    <li
                      key={step.label}
                      aria-current={step.state === 'current' ? 'step' : undefined}
                      className="flex items-start gap-3 py-2"
                    >
                      <Icon
                        className={cn(
                          'mt-px size-5.5 shrink-0',
                          step.state === 'done' && 'text-success-foreground',
                          step.state === 'current' &&
                            (order.status === CANCELLED ? 'text-destructive-text' : 'text-primary'),
                          step.state === 'upcoming' && 'text-icon-muted'
                        )}
                      />
                      <span
                        className={cn(
                          'flex-1 text-[15px] leading-[1.35]',
                          step.state === 'current' && 'font-semibold',
                          step.state === 'upcoming' && 'text-foreground-secondary'
                        )}
                      >
                        {step.label}
                      </span>
                      {step.time && (
                        <span className="text-meta leading-[1.6] text-muted-foreground">
                          {step.time}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>
            </section>
            {order.status === COMPLETED && (
              <LinkButton
                href={urlFor('customer.orders.receipt', { id: order.id })}
                variant="outline"
                size="desktop"
                className="gap-2"
              >
                <IconReceipt className="size-5" />
                Lihat Struk
              </LinkButton>
            )}
            {isOwner && order.canCancel && (
              <Button
                variant="destructive-outline"
                size="desktop"
                className="gap-2"
                onPress={() => setCancelling(true)}
              >
                <IconBan className="size-5" />
                Batalkan Pesanan
              </Button>
            )}
            {order.cancelReason && (
              <p className="text-sm leading-[1.45] text-foreground-secondary">
                Alasan pembatalan: {order.cancelReason}
              </p>
            )}
            <a
              href={helpLink(order.number)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-icon-btn items-center justify-center gap-2 text-[15px] font-semibold text-primary hover:text-primary-hover"
            >
              <IconMessage className="size-5" />
              Butuh bantuan? Chat via WhatsApp
            </a>
          </aside>
        </div>
      </div>
      <CancelDialog
        key={isCancelling ? 'cancel-open' : 'cancel'}
        isOpen={isCancelling}
        onOpenChange={setCancelling}
        title={`Batalkan pesanan ${order.number}?`}
        description="Bisa dibatalkan selama kurir belum berangkat."
        reasons={CUSTOMER_CANCEL_REASONS}
        confirmLabel="Batalkan Pesanan"
        onConfirm={(reason) =>
          router.post(
            urlFor('customer.orders.cancel', { id: order.id }),
            { reason },
            { preserveScroll: true, onSuccess: () => setCancelling(false) }
          )
        }
      />
    </>
  )
}

OrderDetail.layout = [AccountLayout]
