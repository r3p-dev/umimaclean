import { Link } from '@adonisjs/inertia/react'
import { IconCircleCheck, IconDeviceFloppy } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { formatRupiah } from '~/lib/shared/format'
import { cn } from '~/lib/shared/utils'

export default function BillSummaryCard({
  rows,
  total,
  missing,
  isSaved,
  savedText,
  next,
  isSaving = false,
  onSave,
}: {
  rows: { key: string; title: string; subtotal: number; services: string }[]
  total: number
  missing: number
  isSaved: boolean
  savedText: string
  next: { href: string; label: string }
  isSaving?: boolean
  onSave: () => void
}) {
  return (
    <div className="min-w-0">
      <div className="lg:sticky lg:top-4">
        <Card role="region" aria-labelledby="bill-title">
          <CardHeader>
            <CardTitle as="h2" id="bill-title">
              Ringkasan tagihan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length > 0 && (
              <ul className="divide-y divide-border">
                {rows.map((row) => (
                  <li key={row.key} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                    <div className="flex justify-between gap-2.5 font-semibold">
                      <span>{row.title}</span>
                      <span>{formatRupiah(row.subtotal)}</span>
                    </div>
                    <span className="text-meta text-muted-foreground">{row.services}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <span className="text-md leading-none font-semibold">Total</span>
              <span className="text-2xl leading-none font-bold tracking-tight">
                {formatRupiah(total)}
              </span>
            </div>
            {isSaved ? (
              <div
                role="status"
                className="flex flex-col gap-2.5 rounded-md bg-success p-3 text-sm font-medium text-success-foreground"
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
                  isPending={isSaving}
                  onPress={onSave}
                  className={cn('text-md', missing > 0 && 'h-13')}
                >
                  {missing === 0 && <IconDeviceFloppy />}
                  {isSaving ? 'Menyimpan…' : 'Simpan Pemeriksaan'}
                </Button>
                {missing > 0 && (
                  <span className="text-meta font-medium text-destructive-text">
                    {missing} barang belum diberi nama atau layanan utama
                  </span>
                )}
              </>
            )}
            <p className="text-caption text-muted-foreground">
              Pesanan online: tagihan dikirim ke WhatsApp pelanggan untuk dibayar dengan QRIS, lalu
              pesanan masuk Dalam Pencucian setelah lunas. Pesanan toko: lanjut ke pembayaran di
              kasir.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
