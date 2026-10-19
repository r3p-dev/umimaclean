import { IconArrowDown, IconRosetteDiscountCheck } from '@tabler/icons-react'
import { Alert } from '~/components/ui/alert'

const STEPS = [
  {
    title: 'Pesan penjemputan',
    description: 'Pilih tanggal dan jam, kurir kami datang ke alamat Anda.',
  },
  {
    title: 'Kami periksa barangnya',
    description: 'Tim kami menentukan layanan dan harga setelah melihat kondisi setiap barang.',
    note: 'Anda tidak perlu memilih layanan.',
    link: { href: '#harga', label: 'Lihat daftar harga' },
  },
  {
    title: 'Bayar, lalu kami cuci',
    description:
      'Tagihan dikirim via WhatsApp. Bayar dengan scan QRIS dari aplikasi pembayaran apa pun.',
  },
  {
    title: 'Kami antar kembali',
    description: 'Pantau statusnya kapan saja lewat Lacak Pesanan.',
  },
]

export default function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      className="mx-auto box-content flex max-w-page flex-col gap-4.5 px-5 pt-8 pb-2"
    >
      <h2 className="text-title">Cara kerjanya</h2>

      <ol className="grid gap-x-6 gap-y-4.5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="grid grid-cols-[32px_1fr] content-start gap-3.5">
            <span
              data-surface="inverse"
              className="size-8 rounded-full bg-surface-inverse text-center text-sm leading-8 font-semibold text-surface-inverse-foreground"
            >
              {index + 1}
            </span>

            <div className="flex flex-col gap-2.5">
              <div>
                <h3 className="text-base leading-[1.3] font-semibold">{step.title}</h3>
                <p className="mt-0.75 text-sm leading-normal text-foreground-secondary">
                  {step.description}
                </p>
              </div>

              {step.note && (
                <Alert variant="attention" size="sm" role="note" className="font-semibold">
                  <IconRosetteDiscountCheck />
                  {step.note}
                </Alert>
              )}

              {step.link && (
                <a
                  href={step.link.href}
                  className="hit-area inline-flex items-center gap-1 self-start text-sm leading-[1.4] font-semibold text-primary hover:text-primary-hover hover:underline"
                >
                  {step.link.label}
                  <IconArrowDown className="size-4.5 shrink-0" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
