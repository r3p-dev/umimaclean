import { useEffect, useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { urlFor } from '~/client'
import DemoSwitcher from '~/components/organisms/demo_switcher'
import FlowHeader from '~/components/organisms/flow_header'
import PaymentSuccess from '~/components/organisms/payment/payment_success'
import QrisPanel from '~/components/organisms/payment/qris_panel'
import FlowLayout from '~/components/templates/flow_layout'
import { billTotal } from '~/lib/payment/bill'
import { useQrisSession } from '~/lib/payment/qris'
import { formatRupiah } from '~/lib/shared/format'
import { useOrderAccess } from '~/lib/tracking/access'
import { isPaid } from '~/lib/tracking/status'

type PaymentState = 'auto' | 'pending' | 'paid' | 'expired'

const DEMO_STATES: { value: PaymentState; label: string }[] = [
  { value: 'auto', label: 'Otomatis' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'paid', label: 'Berhasil' },
  { value: 'expired', label: 'Kedaluwarsa' },
]

export default function PaymentQris({ number }: { number: string }) {
  const { order, allowed } = useOrderAccess(number)
  const qris = useQrisSession(number)
  const [demoState, setDemoState] = useState<PaymentState>('auto')
  const missingBill = !order || !order.bill

  useEffect(() => {
    if (missingBill) router.visit(urlFor('tracking.status', { number }), { replace: true })
  }, [missingBill, number])

  if (!order || !order.bill || !allowed) return null

  const total = formatRupiah(billTotal(order.bill))
  const state =
    demoState !== 'auto' ? demoState : isPaid(order) ? 'paid' : qris.expired ? 'expired' : 'pending'

  return (
    <div className="min-h-screen bg-card">
      <Head title={`Bayar dengan QRIS · ${order.number}`} />
      <FlowHeader title="Bayar dengan QRIS" showLogo={false} />
      {state === 'paid' ? (
        <PaymentSuccess
          number={order.number}
          total={total}
          paidOn={order.paidOn ?? order.paidAt ?? 'Baru saja'}
        />
      ) : (
        <QrisPanel
          number={order.number}
          total={total}
          expired={state === 'expired'}
          remaining={qris.remaining}
          onRenew={() => {
            qris.renew()
            setDemoState('auto')
          }}
        />
      )}
      <DemoSwitcher
        label="Ubah status pembayaran (demo)"
        options={DEMO_STATES}
        value={demoState}
        onChange={setDemoState}
      />
    </div>
  )
}

PaymentQris.layout = [FlowLayout]
