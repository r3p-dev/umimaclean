import { useEffect, useRef, useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { urlFor } from '~/client'
import BackLink from '~/components/molecules/back_link'
import FlowHeader from '~/components/organisms/flow_header'
import QrisPanel from '~/components/organisms/payment/qris_panel'
import FlowLayout from '~/components/templates/flow_layout'
import { Alert } from '~/components/ui/alert'
import { LinkButton } from '~/components/ui/button'
import { useCountdown } from '~/lib/shared/countdown'
import { formatRupiah } from '~/lib/shared/format'
import { useLiveReload } from '~/lib/shared/live'
import type { OrderRecord } from '~/lib/tracking/orders'
import { AWAITING_PAYMENT, isPaid } from '~/lib/tracking/status'

type Qris = { qrUrl: string | null; expiresAt: string | null; status: string }

export default function PaymentQris({
  id,
  order,
  qris,
  isAvailable,
}: {
  id: number
  number: string
  order: OrderRecord | null
  qris: Qris | null
  isAvailable: boolean
}) {
  const [isWorking, setWorking] = useState(false)
  const hasRequested = useRef(false)
  const expiresAt = qris?.expiresAt ? new Date(qris.expiresAt).getTime() : null
  const remaining = useCountdown(expiresAt)
  const isMissingBill = !order || !order.bill
  const isPayable = !!order && order.status === AWAITING_PAYMENT

  useLiveReload(`orders/${id}`, ['order', 'qris'])

  const busy = { onStart: () => setWorking(true), onFinish: () => setWorking(false) }

  function renew() {
    router.post(urlFor('customer.orders.pay.start', { id }), {}, busy)
  }

  useEffect(() => {
    if (isMissingBill) {
      router.visit(urlFor('customer.orders.show', { id }), { replace: true })
      return
    }
    if (isAvailable && isPayable && !qris && !hasRequested.current) {
      hasRequested.current = true
      renew()
    }
  })

  if (!order || !order.bill) {
    return null
  }

  const total = formatRupiah(order.bill.total)

  return (
    <div className="min-h-screen bg-card">
      <Head title={`Bayar dengan QRIS · ${order.number}`} />
      <FlowHeader title="Bayar dengan QRIS" showLogo={false} />
      <h1 className="sr-only">Bayar dengan QRIS · {order.number}</h1>
      {isPaid(order) ? (
        <div className="mx-auto flex max-w-130 flex-col items-center gap-3 px-5 pt-10 pb-7 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-success text-success-foreground">
            <IconCheck className="size-9" />
          </span>
          <h1 className="mt-1.5 text-2xl leading-[1.2] font-bold">Pembayaran berhasil</h1>
          <p className="text-[15px] leading-normal text-foreground-secondary">
            {total} diterima. Barang Anda masuk antrean pencucian.
          </p>
          <dl className="mt-2.5 self-stretch rounded-lg border border-border px-4 text-left text-sm leading-[1.4]">
            <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.75 last:border-b-0">
              <dt className="text-muted-foreground">Metode</dt>
              <dd className="text-right font-semibold">QRIS</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.75 last:border-b-0">
              <dt className="text-muted-foreground">Waktu</dt>
              <dd className="text-right font-semibold">{order.paidOn ?? 'Baru saja'}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.75 last:border-b-0">
              <dt className="text-muted-foreground">No. pesanan</dt>
              <dd className="text-right font-mono text-[13.5px] font-semibold">{order.number}</dd>
            </div>
          </dl>
          <LinkButton
            size="cta"
            className="mt-2 self-stretch"
            href={urlFor('customer.orders.show', { id: order.id })}
          >
            Lihat Status Pesanan
          </LinkButton>
        </div>
      ) : !isAvailable || !isPayable ? (
        <div className="mx-auto box-content flex max-w-130 flex-col gap-4 px-5 pt-8 pb-8">
          <Alert variant="attention">
            <IconAlertCircle className="size-5" />
            {isPayable
              ? 'Pembayaran QRIS belum tersedia. Bayar di toko atau hubungi kami via WhatsApp.'
              : 'Pesanan ini tidak menunggu pembayaran.'}
          </Alert>
          <BackLink
            href={urlFor('customer.orders.show', { id })}
            label="Kembali ke Detail Pesanan"
          />
        </div>
      ) : (
        <QrisPanel
          id={order.id}
          number={order.number}
          total={total}
          qrUrl={qris?.qrUrl ?? null}
          isExpired={!!qris && remaining === 0}
          remaining={remaining}
          isWorking={isWorking}
          onRenew={renew}
          onCheck={() => router.post(urlFor('customer.orders.pay.check', { id }), {}, busy)}
        />
      )}
    </div>
  )
}

PaymentQris.layout = [FlowLayout]
