import { IconBellRinging, IconExclamationMark, IconQrcode } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button, LinkButton } from '~/components/ui/button'

export default function ActionCard({
  needsPay,
  number,
  total,
  onShowDetails,
}: {
  needsPay: boolean
  number: string
  total: string | null
  onShowDetails: () => void
}) {
  if (!needsPay) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-4 py-3.5 text-sm leading-normal text-foreground-secondary">
        <IconBellRinging className="my-px size-5 shrink-0 text-success-foreground" />
        Tidak ada yang perlu Anda lakukan sekarang. Kami kabari via WhatsApp di setiap tahap.
      </div>
    )
  }

  return (
    <section className="overflow-hidden rounded-lg border border-attention-border-soft bg-card">
      <h2 className="flex items-center gap-1.5 bg-status-bayar-bg px-4 py-2.5 text-meta leading-[1.3] font-semibold text-attention-foreground">
        <IconExclamationMark className="size-4.25" />
        Perlu tindakan Anda
      </h2>
      <div className="flex flex-col gap-3 p-4">
        <p className="text-[15px] leading-normal">
          Bayar <strong className="font-bold">{total}</strong> dengan QRIS agar pencucian bisa
          dimulai.
        </p>
        <div className="flex gap-2">
          <LinkButton size="cta" className="flex-1" href={urlFor('payment.bill', { number })}>
            <IconQrcode />
            Bayar dengan QRIS
          </LinkButton>
          <Button
            variant="outline"
            size="cta"
            onPress={onShowDetails}
            className="px-3.5 text-sm lg:hidden"
          >
            Rincian
          </Button>
        </div>
      </div>
    </section>
  )
}
