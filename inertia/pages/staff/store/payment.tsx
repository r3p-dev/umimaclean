import { useId, useState } from 'react'
import { Head } from '@inertiajs/react'
import { toast } from 'sonner'
import { IconCheck, IconLoader2, IconReceipt, IconWashMachine } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button, LinkButton } from '~/components/ui/button'
import { FieldDescription, FieldError } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import SourceTag from '~/components/atoms/source_tag'
import DemoSwitcher from '~/components/organisms/demo_switcher'
import StaffMissingOrder from '~/components/organisms/staff_missing_order'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import PaymentMethodPicker from '~/components/organisms/store/payment_method_picker'
import StaffLayout from '~/components/templates/staff_layout'
import { storeSettings } from '~/lib/settings/store_settings'
import { formatRupiah } from '~/lib/shared/format'
import { useWorkday, type PaymentMethod } from '~/lib/staff/workday'
import {
  METHOD_LABEL,
  PAYMENT_METHODS,
  cancelPayment,
  formatRupiahInput,
  parseRupiah,
  qrisReference,
  recordPayment,
  storeBill,
} from '~/lib/store/payment'

export default function StorePayment({ number }: { number: string }) {
  const day = useWorkday()
  const settings = storeSettings.use()
  const bill = storeBill(day, number)
  const methods = PAYMENT_METHODS.filter((method) => settings.payments[method.key])
  const [picked, setPicked] = useState<PaymentMethod | null>(null)
  const [received, setReceived] = useState<number | null>(null)
  const [reference, setReference] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const fieldId = useId()
  const back = { href: urlFor('staff.process'), label: 'Kembali ke Proses' }
  const method = picked && methods.some((item) => item.key === picked) ? picked : methods[0]?.key

  if (!bill) {
    return (
      <StaffLayout active="proses">
        <Head title="Pembayaran di toko" />
        <StaffTopBar title="Pembayaran di toko" subtitle={number} back={back} variant="detail" />
        <StaffMissingOrder number={number} backHref={back.href} backLabel={back.label} />
      </StaffLayout>
    )
  }

  const { order, total, payment } = bill
  const change = received !== null ? received - total : null

  function choose(next: PaymentMethod) {
    setPicked(next)
    setError(null)
  }

  async function confirm() {
    if (!method) return
    if (method === 'cash' && (received === null || received < total)) {
      setError(
        received === null
          ? 'Isi jumlah uang yang diterima.'
          : `Uang diterima kurang ${formatRupiah(total - received)}.`
      )
      return
    }
    if (method === 'edc' && reference.trim().length < 4) {
      setError('Isi nomor referensi dari struk EDC.')
      return
    }
    if (method === 'qris') {
      setChecking(true)
      await new Promise((resolve) => window.setTimeout(resolve, 800))
      setChecking(false)
    }
    recordPayment(number, {
      method,
      amount: total,
      received: method === 'cash' ? received : null,
      reference: method === 'edc' ? reference.trim() : method === 'qris' ? qrisReference() : null,
    })
  }

  const rows = payment
    ? [
        ['Status', 'Lunas'],
        ['Metode', METHOD_LABEL[payment.method]],
        ['Jumlah', formatRupiah(payment.amount)],
        ['Waktu', payment.stamp],
        ...(payment.method === 'cash' && payment.received !== null
          ? [
              ['Uang diterima', formatRupiah(payment.received)],
              ['Kembalian', formatRupiah(payment.received - payment.amount)],
            ]
          : payment.method === 'edc'
            ? [['No. referensi', payment.reference ?? '—']]
            : [['ID transaksi QRIS', payment.reference ?? '—']]),
      ]
    : []

  return (
    <StaffLayout active="proses">
      <Head title={`Pembayaran ${number}`} />
      <StaffTopBar
        title="Pembayaran di toko"
        subtitle={`${order.number} · ${order.customer}`}
        back={back}
        variant="detail"
        actions={<SourceTag store shape="pill" />}
      />
      <div className="mx-auto flex w-full max-w-160 flex-col gap-3.5 p-4">
        <section className="rounded-lg border border-border bg-card px-4 pt-1 pb-3.5">
          <h2 className="mt-3 mb-2 text-base leading-[1.3] font-semibold">Tagihan</h2>
          {bill.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-1.5 border-t border-border py-2.5">
              <span className="text-[15px] leading-[1.3] font-semibold">{item.title}</span>
              {item.lines.map((line) => (
                <div
                  key={line.name}
                  className="flex justify-between gap-3 text-[14.5px] leading-[1.4]"
                >
                  <span>{line.name}</span>
                  <span>{formatRupiah(line.price)}</span>
                </div>
              ))}
            </div>
          ))}
          <div className="flex items-baseline justify-between border-t border-border-strong pt-3">
            <span className="text-[15px] leading-none font-semibold">Total</span>
            <span className="text-2xl leading-none font-bold tracking-[-0.01em]">
              {formatRupiah(total)}
            </span>
          </div>
        </section>

        {!bill.saved ? (
          <section className="flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-4">
            <h2 className="text-base leading-[1.3] font-semibold">Pemeriksaan belum disimpan</h2>
            <p className="text-note leading-[1.45] text-foreground-secondary">
              Tentukan layanan dan simpan pemeriksaan dulu agar tagihan bisa dibayar.
            </p>
            <LinkButton
              variant="outline"
              size="desktop"
              href={urlFor('staff.inspection', { number })}
            >
              Buka Pemeriksaan
            </LinkButton>
          </section>
        ) : payment ? (
          <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
                <IconCheck className="size-6.5" />
              </span>
              <h2 role="status" className="text-[19px] leading-[1.3] font-bold">
                Pembayaran lunas
              </h2>
            </div>
            <dl className="rounded-md border border-border px-3.5">
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-border py-2.5 text-sm leading-[1.4] last:border-b-0"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="flex gap-2 text-sm leading-[1.45] text-foreground-secondary">
              <IconWashMachine className="mt-0.5 size-4.5 shrink-0 text-status-cuci-fg" />
              Pesanan langsung masuk Dalam Pencucian. Bila pelanggan minta diantar, pesanan masuk
              antrean Antar setelah selesai dicuci.
            </p>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Button
                variant="outline"
                onPress={() => toast.success(`Struk dikirim ke WhatsApp ${order.customer}.`)}
                className="text-[15px]"
              >
                <IconReceipt />
                Kirim Struk via WhatsApp
              </Button>
              <LinkButton variant="ghost" className="px-3 text-primary" href={back.href}>
                Selesai
              </LinkButton>
            </div>
          </section>
        ) : (
          <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <div>
              <h2 className="text-base leading-[1.3] font-semibold">Metode pembayaran</h2>
              <p className="mt-1 text-meta leading-[1.45] text-muted-foreground">
                Khusus transaksi di toko. Pesanan online hanya bisa dibayar dengan QRIS.
              </p>
            </div>
            {method ? (
              <>
                <PaymentMethodPicker methods={methods} value={method} onChange={choose} />
                {method === 'qris' && (
                  <div className="flex flex-col items-center gap-2.5 rounded-md bg-background p-3.5">
                    <div className="stripes flex size-45 items-center justify-center rounded-inner p-4 text-center [--stripe-angle:45deg] [--stripe:8px]">
                      <span className="rounded-xs bg-surface-glass px-1.75 py-1 font-mono text-2xs leading-[1.4] font-medium text-foreground-secondary">
                        kode QRIS dinamis
                      </span>
                    </div>
                    <span className="text-center text-note leading-[1.45] text-foreground-secondary">
                      Tunjukkan layar ke pelanggan. Status berubah otomatis setelah pembayaran
                      masuk.
                    </span>
                  </div>
                )}
                {method === 'cash' && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={fieldId}>Uang diterima</Label>
                    <Input
                      id={fieldId}
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="Rp0"
                      value={formatRupiahInput(received)}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? `${fieldId}-error` : undefined}
                      onChange={(event) => {
                        setReceived(parseRupiah(event.target.value))
                        setError(null)
                      }}
                      className="text-lg font-semibold"
                    />
                    {error ? (
                      <FieldError id={`${fieldId}-error`}>{error}</FieldError>
                    ) : (
                      change !== null &&
                      change >= 0 && (
                        <div className="flex items-baseline justify-between rounded-md bg-success px-3 py-2.5 text-[15px] leading-[1.3] font-semibold text-success-foreground">
                          <span>Kembalian</span>
                          <span>{formatRupiah(change)}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
                {method === 'edc' && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={fieldId}>No. referensi / approval code</Label>
                    <Input
                      id={fieldId}
                      autoComplete="off"
                      value={reference}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={`${fieldId}-hint`}
                      onChange={(event) => {
                        setReference(event.target.value.slice(0, 20))
                        setError(null)
                      }}
                      className="font-mono text-[17px] font-medium"
                    />
                    {error ? (
                      <FieldError id={`${fieldId}-hint`}>{error}</FieldError>
                    ) : (
                      <FieldDescription id={`${fieldId}-hint`} className="text-caption">
                        Lihat di struk EDC setelah kartu berhasil diproses.
                      </FieldDescription>
                    )}
                  </div>
                )}
                <Button size="cta" onPress={confirm} isDisabled={checking}>
                  {checking && <IconLoader2 className="animate-spin" />}
                  {checking
                    ? 'Mengecek pembayaran…'
                    : method === 'qris'
                      ? 'Cek Pembayaran QRIS'
                      : method === 'cash'
                        ? `Terima Tunai · ${formatRupiah(total)}`
                        : `Konfirmasi EDC · ${formatRupiah(total)}`}
                </Button>
              </>
            ) : (
              <p className="text-note leading-[1.45] text-destructive-text">
                Semua metode toko sedang nonaktif. Aktifkan di Pengaturan owner.
              </p>
            )}
          </section>
        )}
      </div>
      <DemoSwitcher
        className="max-sm:bottom-19 sm:right-3 sm:left-auto"
        label="Data contoh pembayaran"
        options={[
          { value: 'keep', label: payment ? 'Sudah lunas' : 'Belum dibayar' },
          { value: 'reset', label: 'Batalkan pembayaran' },
        ]}
        value="keep"
        onChange={(value) => {
          if (value === 'reset') cancelPayment(number)
        }}
      />
    </StaffLayout>
  )
}
