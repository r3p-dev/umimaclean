import { IconBolt, IconCircleCheckFilled, IconQrcode } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { LinkButton } from '~/components/ui/button'
import BackLink from '~/components/molecules/back_link'
import InfoNote from '~/components/molecules/info_note'

export default function PaymentMethodPanel({
  number,
  total,
  paidAt,
}: {
  number: string
  total: string
  paidAt: string | null
}) {
  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col gap-2.5 pt-5">
        <h2 className="text-[17px] leading-[1.3] font-semibold">Metode pembayaran</h2>
        <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-border-strong p-3.5">
          <span className="grid size-11 place-items-center rounded-md border border-border bg-background">
            <IconQrcode className="size-6.5" />
          </span>
          <div>
            <p className="text-base leading-[1.3] font-bold">QRIS</p>
            <p className="mt-0.5 text-sm leading-[1.45] text-foreground-secondary">
              Scan kode QR dengan aplikasi pembayaran pilihan Anda yang mendukung QRIS.
            </p>
          </div>
        </div>
        <InfoNote
          icon={IconBolt}
          tone="plain"
          size="sm"
          className="[&>svg]:my-[1.6px] [&>svg]:size-4"
        >
          Status pesanan diperbarui otomatis begitu pembayaran masuk.
        </InfoNote>
      </div>
      <div className="-mx-5 mt-5 flex flex-col gap-1.5 border-t border-border px-5 pt-5 pb-6 lg:mx-0 lg:px-0">
        {paidAt ? (
          <Alert variant="success">
            <IconCircleCheckFilled />
            <AlertDescription>Tagihan sudah dibayar · {paidAt}</AlertDescription>
          </Alert>
        ) : (
          <LinkButton
            size="cta"
            className="w-full"
            href={urlFor('customer.orders.pay', { code: number })}
          >
            <IconQrcode />
            Bayar dengan QRIS · {total}
          </LinkButton>
        )}
        <BackLink
          href={urlFor('customer.orders.show', { code: number })}
          label="Kembali ke Status Pesanan"
          className="ml-0 self-stretch"
        />
      </div>
    </div>
  )
}
