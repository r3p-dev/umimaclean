import { useEffect, useRef, useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { IconAlertCircle } from '@tabler/icons-react'
import { urlFor } from '~/client'
import BackLink from '~/components/molecules/back_link'
import FlowHeader from '~/components/organisms/flow_header'
import PaymentSuccess from '~/components/organisms/payment/payment_success'
import QrisPanel from '~/components/organisms/payment/qris_panel'
import FlowLayout from '~/components/templates/flow_layout'
import { Alert } from '~/components/ui/alert'
import { useCountdown } from '~/lib/shared/countdown'
import { formatRupiah } from '~/lib/shared/format'
import { useLiveReload } from '~/lib/shared/live'
import type { OrderRecord } from '~/lib/tracking/orders'
import { AWAITING_PAYMENT, isPaid } from '~/lib/tracking/status'

type Qris = { qrUrl: string | null; expiresAt: string | null; status: string }

export default function PaymentQris({
  number,
  order,
  qris,
  isAvailable,
}: {
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

  useLiveReload(`orders/${number}`, ['order', 'qris'])

  const busy = { onStart: () => setWorking(true), onFinish: () => setWorking(false) }

  function renew() {
    router.post(urlFor('customer.orders.pay.start', { code: number }), {}, busy)
  }

  useEffect(() => {
    if (isMissingBill) {
      router.visit(urlFor('customer.orders.show', { code: number }), { replace: true })
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
        <PaymentSuccess number={order.number} total={total} paidOn={order.paidOn ?? 'Baru saja'} />
      ) : !isAvailable || !isPayable ? (
        <div className="mx-auto box-content flex max-w-130 flex-col gap-4 px-5 pt-8 pb-8">
          <Alert variant="attention">
            <IconAlertCircle className="size-5" />
            {isPayable
              ? 'Pembayaran QRIS belum tersedia. Bayar di toko atau hubungi kami via WhatsApp.'
              : 'Pesanan ini tidak menunggu pembayaran.'}
          </Alert>
          <BackLink
            href={urlFor('customer.orders.show', { code: number })}
            label="Kembali ke Detail Pesanan"
          />
        </div>
      ) : (
        <QrisPanel
          number={order.number}
          total={total}
          qrUrl={qris?.qrUrl ?? null}
          isExpired={!!qris && remaining === 0}
          remaining={remaining}
          isWorking={isWorking}
          onRenew={renew}
          onCheck={() =>
            router.post(urlFor('customer.orders.pay.check', { code: number }), {}, busy)
          }
        />
      )}
    </div>
  )
}

PaymentQris.layout = [FlowLayout]
