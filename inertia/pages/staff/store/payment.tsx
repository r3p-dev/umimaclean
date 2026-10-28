import { useId, useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { IconCheck, IconPrinter, IconRefresh, IconWashMachine } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button, LinkButton } from '~/components/ui/button'
import { FieldDescription, FieldError } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import SourceTag from '~/components/atoms/source_tag'
import StaffMissingOrder from '~/components/organisms/staff_missing_order'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import PaymentMethodPicker from '~/components/organisms/store/payment_method_picker'
import StaffLayout from '~/components/templates/staff_layout'
import { useCountdown } from '~/lib/shared/countdown'
import { formatDuration, formatRupiah } from '~/lib/shared/format'
import { useLiveReload } from '~/lib/shared/live'
import {
  PAYMENT_METHODS,
  formatRupiahInput,
  parseRupiah,
  type PaymentMethod,
} from '~/lib/store/payment'

type Receipt = {
  number: string
  customer: string
  createdAt: string
  items: {
    name: string
    kind: string
    services: { name: string; price: number }[]
    subtotal: number
  }[]
  total: number
  payment: {
    method: string
    paidAt: string
    reference: string | null
    cashReceived: number | null
    change: number | null
  } | null
  isSaved: boolean
  isPaid: boolean
}

type Qris = { qrUrl: string | null; expiresAt: string | null; status: string }

export default function StorePayment({
  id,
  number,
  order,
  methods: enabled,
  isQrisAvailable,
  qris,
}: {
  id: number
  number: string
  order: Receipt | null
  methods: Record<PaymentMethod, boolean>
  isQrisAvailable: boolean
  qris: Qris | null
}) {
  const methods = PAYMENT_METHODS.filter(
    (method) => enabled[method.key] && (method.key !== 'qris' || isQrisAvailable)
  )
  const [picked, setPicked] = useState<PaymentMethod | null>(null)
  const [received, setReceived] = useState<number | null>(null)
  const [reference, setReference] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setBusy] = useState(false)
  const fieldId = useId()
  const back = { href: urlFor('staff.process'), label: 'Kembali ke Proses' }
  const method = picked && methods.some((item) => item.key === picked) ? picked : methods[0]?.key
  const remaining = useCountdown(qris?.expiresAt ? new Date(qris.expiresAt).getTime() : null)
  useLiveReload(`orders/${id}`, ['order', 'qris'])

  if (!order) {
    return (
      <StaffLayout active="proses">
        <Head title="Pembayaran di toko" />
        <StaffTopBar title="Pembayaran di toko" subtitle={number} back={back} variant="detail" />
        <StaffMissingOrder number={number} backHref={back.href} backLabel={back.label} />
      </StaffLayout>
    )
  }

  const { total, payment } = order
  const change = received !== null ? received - total : null
  const busy = { onStart: () => setBusy(true), onFinish: () => setBusy(false) }

  function choose(next: PaymentMethod) {
    setPicked(next)
    setError(null)
  }

  function confirm() {
    if (!method || isBusy) {
      return
    }
    if (method === 'qris') {
      router.post(
        urlFor(
          qris && remaining > 0 ? 'staff.store_payment.qris_check' : 'staff.store_payment.qris',
          {
            id,
          }
        ),
        {},
        busy
      )
      return
    }
    if (method === 'cash' && (received === null || received < total)) {
      setError(
        received === null
          ? 'Isi jumlah uang yang diterima.'
          : `Uang diterima kurang ${formatRupiah(total - received)}.`
      )
      return
    }
    if (method === 'edc' && !reference.trim()) {
      setError('Isi nomor referensi dari struk EDC.')
      return
    }
    if (method === 'edc' && reference.trim().length < 4) {
      setError('Nomor referensi minimal 4 karakter.')
      return
    }
    router.post(
      urlFor('staff.store_payment.record', { id }),
      method === 'cash'
        ? { method: 'cash', cashReceived: received }
        : { method: 'card', reference: reference.trim() },
      {
        ...busy,
        preserveScroll: true,
        onError: (errors) =>
          setError(errors.cashReceived ?? errors.reference ?? errors.method ?? null),
      }
    )
  }

  const rows = payment
    ? [
        ['Status', 'Lunas'],
        ['Metode', payment.method],
        ['Jumlah', formatRupiah(total)],
        ['Waktu', payment.paidAt],
        ...(payment.cashReceived !== null
          ? [
              ['Uang diterima', formatRupiah(payment.cashReceived)],
              ['Kembalian', formatRupiah(payment.change ?? 0)],
            ]
          : [['No. referensi', payment.reference ?? '—']]),
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
        actions={<SourceTag isInStore shape="pill" />}
      />
      <div className="mx-auto flex w-full max-w-160 flex-col gap-3.5 p-4">
        <section className="rounded-lg border border-border bg-card px-4 pt-1 pb-3.5">
          <h2 className="mt-3 mb-2 text-base leading-[1.3] font-semibold">Tagihan</h2>
          {order.items.map((item, index) => (
            <div key={index} className="flex flex-col gap-1.5 border-t border-border py-2.5">
              <span className="text-[15px] leading-[1.3] font-semibold">{item.name}</span>
              {item.services.map((line) => (
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

        {!order.isSaved ? (
          <section className="flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-4">
            <h2 className="text-base leading-[1.3] font-semibold">Pemeriksaan belum disimpan</h2>
            <p className="text-note leading-[1.45] text-foreground-secondary">
              Tentukan layanan dan simpan pemeriksaan dulu agar tagihan bisa dibayar.
            </p>
            <LinkButton variant="outline" size="desktop" href={urlFor('staff.inspection', { id })}>
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
            <LinkButton className="text-[15px]" href={urlFor('staff.print.receipt', { id })}>
              <IconPrinter />
              Cetak struk
            </LinkButton>
            <LinkButton variant="outline" className="text-[15px]" href={back.href}>
              Selesai
            </LinkButton>
          </section>
        ) : (
          <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <div>
              <h2 className="text-base leading-[1.3] font-semibold">Metode pembayaran</h2>
              <p className="mt-1 text-meta leading-[1.45] text-muted-foreground">
                Khusus transaksi di toko. Pesanan online dibayar pelanggan dengan QRIS dari tagihan
                WhatsApp.
                {!isQrisAvailable &&
                  enabled.qris &&
                  ' QRIS belum tersedia: Midtrans belum dikonfigurasi.'}
              </p>
            </div>
            {method ? (
              <>
                <PaymentMethodPicker methods={methods} value={method} onChange={choose} />
                {method === 'qris' && (
                  <div className="flex flex-col items-center gap-2.5 rounded-md bg-background p-3.5">
                    {qris?.qrUrl && remaining > 0 ? (
                      <>
                        <img
                          src={qris.qrUrl}
                          alt={`Kode QRIS ${number}`}
                          className="size-45 rounded-inner bg-card object-contain"
                        />
                        <span className="text-center text-note leading-[1.45] text-foreground-secondary">
                          Tunjukkan layar ke pelanggan. Status berubah otomatis setelah pembayaran
                          masuk · berlaku{' '}
                          <span className="font-mono font-semibold">
                            {formatDuration(remaining)}
                          </span>
                        </span>
                      </>
                    ) : (
                      <span className="text-center text-note leading-[1.45] text-foreground-secondary">
                        {qris
                          ? 'Kode QR kedaluwarsa. Buat kode baru.'
                          : 'Buat kode QRIS untuk ditunjukkan ke pelanggan.'}
                      </span>
                    )}
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
                <Button size="cta" onPress={confirm} isPending={isBusy}>
                  {method === 'qris' && <IconRefresh />}
                  {isBusy
                    ? 'Memproses…'
                    : method === 'qris'
                      ? qris && remaining > 0
                        ? 'Cek Pembayaran QRIS'
                        : 'Buat Kode QRIS'
                      : method === 'cash'
                        ? `Terima Tunai · ${formatRupiah(total)}`
                        : `Konfirmasi EDC · ${formatRupiah(total)}`}
                </Button>
              </>
            ) : (
              <p className="text-note leading-[1.45] text-destructive-text">
                Tidak ada metode pembayaran toko yang aktif. Aktifkan di Pengaturan owner.
              </p>
            )}
          </section>
        )}
      </div>
    </StaffLayout>
  )
}
