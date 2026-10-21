import { useEffect } from 'react'
import { Head, router } from '@inertiajs/react'
import { urlFor } from '~/client'
import FlowHeader from '~/components/organisms/flow_header'
import BillBreakdown from '~/components/organisms/payment/bill_breakdown'
import PaymentMethodPanel from '~/components/organisms/payment/payment_method_panel'
import FlowLayout from '~/components/templates/flow_layout'
import { billTotal } from '~/lib/payment/bill'
import { formatRupiah } from '~/lib/shared/format'
import type { OrderRecord } from '~/lib/tracking/orders'
import { ORDER_STATUSES, isPaid } from '~/lib/tracking/status'

export default function PaymentBill({
  number,
  order,
}: {
  number: string
  order: OrderRecord | null
}) {
  const isMissingBill = !order || !order.bill

  useEffect(() => {
    if (isMissingBill) {
      router.visit(urlFor('customer.orders.show', { code: number }), { replace: true })
    }
  }, [isMissingBill, number])

  if (!order || !order.bill) {
    return null
  }

  return (
    <div className="min-h-screen bg-card">
      <Head title={`Pembayaran · ${order.number}`} />
      <FlowHeader title="Pembayaran" />
      <div className="mx-auto box-content flex max-w-page flex-col px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-x-10">
        <BillBreakdown
          number={order.number}
          status={ORDER_STATUSES[order.status]}
          bill={order.bill}
        />
        <PaymentMethodPanel
          number={order.number}
          total={formatRupiah(billTotal(order.bill))}
          paidAt={isPaid(order) ? (order.paidAt ?? 'Lunas') : null}
        />
      </div>
    </div>
  )
}

PaymentBill.layout = [FlowLayout]
