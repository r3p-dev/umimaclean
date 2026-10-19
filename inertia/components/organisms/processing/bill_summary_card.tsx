import { Link } from '@adonisjs/inertia/react'
import { IconCircleCheck, IconDeviceFloppy } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { formatRupiah } from '~/lib/shared/format'
import { cn } from '~/lib/shared/utils'

export default function BillSummaryCard({
  rows,
  total,
  missing,
  saved,
  savedText,
  next,
  onSave,
}: {
  rows: { key: string; title: string; subtotal: number; services: string }[]
  total: number
  missing: number
  saved: boolean
  savedText: string
  next: { href: string; label: string }
  onSave: () => void
}) {
  return (
    <div className="min-w-0">
      <section
        aria-labelledby="bill-title"
        className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-4 lg:sticky lg:top-4"
      >
        <h2 id="bill-title" className="text-base leading-[1.3] font-semibold">
          Ringkasan tagihan
        </h2>
        {rows.map((row) => (
          <div key={row.key} className="flex flex-col gap-0.75 border-b border-border py-2">
            <div className="flex justify-between gap-2.5 text-sm leading-[1.3] font-semibold">
              <span>{row.title}</span>
              <span>{formatRupiah(row.subtotal)}</span>
            </div>
            <span className="text-meta leading-[1.4] text-muted-foreground">{row.services}</span>
          </div>
        ))}
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-[15px] leading-none font-semibold">Total</span>
          <span className="text-2xl leading-none font-bold tracking-[-0.01em]">
            {formatRupiah(total)}
          </span>
        </div>
        {saved ? (
          <div
            role="status"
            className="flex flex-col gap-2.5 rounded-md bg-success p-3 text-sm leading-[1.45] font-medium text-success-foreground"
          >
            <span className="flex gap-2">
              <IconCircleCheck className="mt-0.5 size-4.5 shrink-0" />
              {savedText}
            </span>
            <Link href={next.href} className="font-semibold">
              {next.label}
            </Link>
          </div>
        ) : (
          <>
            <Button
              size="cta"
              isDisabled={missing > 0}
              onPress={onSave}
              className={cn('text-[15.5px]', missing > 0 && 'h-13')}
            >
              {missing === 0 && <IconDeviceFloppy />}
              Simpan Pemeriksaan
            </Button>
            {missing > 0 && (
              <span className="text-meta leading-[1.4] font-medium text-destructive-text">
                {missing} barang belum punya layanan utama
              </span>
            )}
          </>
        )}
        <p className="text-caption leading-normal text-muted-foreground">
          Pesanan online: sistem mengirim tagihan QRIS dan pengingat otomatis, lalu memindahkan
          pesanan ke Dalam Pencucian setelah lunas. Pesanan toko: lanjut ke pembayaran di kasir.
        </p>
      </section>
    </div>
  )
}
