import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import { SlipDivider, SlipRow, SlipStore } from '~/components/organisms/print/slip'
import PrintLayout from '~/components/templates/print_layout'
import type { Store } from '~/lib/print/sheet'
import { formatRupiah } from '~/lib/shared/format'

export default function PaidReceipt({ receipt, store }: { receipt: Data.Receipt; store: Store }) {
  const payment = receipt.payment

  return (
    <PrintLayout
      title={`Struk ${receipt.number}`}
      backHref={urlFor('staff.store_payment', { id: receipt.id })}
    >
      <SlipStore store={store} />
      <SlipDivider />
      <p className="text-center font-bold">STRUK PEMBAYARAN</p>
      <h1 className="text-center font-slip-mono text-[18px] leading-[1.2] font-bold">
        {receipt.number}
      </h1>
      <p className="text-center">{receipt.customer}</p>
      <p className="text-center">Dibuat {receipt.createdAt}</p>
      <SlipDivider />
      {receipt.items.map((item, index) => (
        <div key={`${item.name}-${index}`} className="flex flex-col">
          <SlipRow label={item.name} isStrong>
            {formatRupiah(item.subtotal)}
          </SlipRow>
          {item.services.map((service) => (
            <SlipRow key={service.name} label={<span className="pl-2">{service.name}</span>}>
              {formatRupiah(service.price)}
            </SlipRow>
          ))}
        </div>
      ))}
      <SlipDivider />
      <div className="text-[14px]">
        <SlipRow label="Total" isStrong>
          {formatRupiah(receipt.total)}
        </SlipRow>
      </div>
      {payment && (
        <>
          <SlipRow label="Metode">{payment.method}</SlipRow>
          <SlipRow label="Dibayar">{payment.paidAt}</SlipRow>
          {payment.cashReceived !== null && (
            <SlipRow label="Uang diterima">{formatRupiah(payment.cashReceived)}</SlipRow>
          )}
          {payment.change !== null && (
            <SlipRow label="Kembalian">{formatRupiah(payment.change)}</SlipRow>
          )}
          {payment.reference && <SlipRow label="Referensi">{payment.reference}</SlipRow>}
        </>
      )}
      <SlipDivider />
      <p className="text-center">Terima kasih sudah memakai {store.name}.</p>
    </PrintLayout>
  )
}
