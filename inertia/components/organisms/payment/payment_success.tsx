import { IconCheck } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { LinkButton } from '~/components/ui/button'
import DetailRows from '~/components/molecules/detail_rows'

export default function PaymentSuccess({
  id,
  number,
  total,
  paidOn,
}: {
  id: number
  number: string
  total: string
  paidOn: string
}) {
  return (
    <div className="mx-auto flex max-w-130 flex-col items-center gap-3 px-5 pt-10 pb-7 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-success text-success-foreground">
        <IconCheck className="size-9" />
      </span>
      <h1 className="mt-1.5 text-2xl leading-[1.2] font-bold">Pembayaran berhasil</h1>
      <p className="text-[15px] leading-normal text-foreground-secondary">
        {total} diterima. Barang Anda masuk antrean pencucian.
      </p>
      <DetailRows
        className="mt-2.5 self-stretch rounded-lg border border-border px-4 text-left"
        rows={[
          { label: 'Metode', value: 'QRIS' },
          { label: 'Waktu', value: paidOn },
          { label: 'No. pesanan', value: number, isMono: true },
        ]}
      />
      <LinkButton
        size="cta"
        className="mt-2 self-stretch"
        href={urlFor('customer.orders.show', { id })}
      >
        Lihat Status Pesanan
      </LinkButton>
    </div>
  )
}
