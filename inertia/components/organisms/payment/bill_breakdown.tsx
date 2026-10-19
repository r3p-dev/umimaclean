import { IconMessage } from '@tabler/icons-react'
import StatusBadge from '~/components/atoms/status_badge'
import BillLineItem from '~/components/molecules/bill_line_item'
import { customerLinks } from '~/lib/navigation/customer_links'
import { billRows, billTotal, type Bill } from '~/lib/payment/bill'
import { formatRupiah } from '~/lib/shared/format'
import type { OrderStatus } from '~/lib/tracking/status'

export default function BillBreakdown({
  number,
  status,
  bill,
}: {
  number: string
  status: OrderStatus
  bill: Bill
}) {
  const total = formatRupiah(billTotal(bill))

  return (
    <div className="w-full min-w-0">
      <div className="flex items-center justify-between pt-5">
        <span className="font-mono text-sm leading-none font-semibold text-foreground-secondary">
          {number}
        </span>
        <StatusBadge status={status} size="lg" />
      </div>
      <div className="flex flex-col gap-1 pt-4.5">
        <h1 className="text-[22px] leading-tight font-bold">Rincian layanan</h1>
        <p className="text-note leading-[1.45] text-muted-foreground">
          Ditentukan oleh tim kami setelah pemeriksaan · {bill.decidedAt}
        </p>
      </div>
      <div className="pt-2">
        <ul>
          {billRows(bill).map((row) => (
            <BillLineItem key={row.name} row={row} />
          ))}
        </ul>
        <div className="flex flex-col gap-2 pt-3.5 text-[14.5px] leading-[1.4] text-foreground-secondary">
          <p className="flex justify-between gap-3">
            <span>Subtotal layanan · {bill.lines.length} barang</span>
            <span>{total}</span>
          </p>
          <p className="flex justify-between gap-3">
            <span>Antar-jemput</span>
            <span className="font-semibold text-success-foreground">Gratis</span>
          </p>
        </div>
        <p className="mt-3.5 flex items-baseline justify-between border-t border-border-strong pt-4 pb-1">
          <span className="text-base leading-none font-semibold">Total</span>
          <span className="text-[22px] leading-none font-bold tracking-[-0.01em]">{total}</span>
        </p>
        <a
          href={customerLinks.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="box-content inline-flex min-h-icon-btn items-center gap-1.5 py-2 text-sm leading-[1.3] font-semibold text-primary hover:text-primary-hover hover:underline"
        >
          <IconMessage className="size-4.5" />
          Ada pertanyaan soal layanan? Chat kami
        </a>
      </div>
    </div>
  )
}
