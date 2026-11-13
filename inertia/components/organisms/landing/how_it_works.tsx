import { IconRosetteDiscountCheck } from '@tabler/icons-react'
import Note from '~/components/atoms/note'

const STEPS = [
  {
    title: 'Pesan penjemputan',
    description: 'Pilih tanggal dan jam, kurir kami datang ke alamat Anda.',
  },
  {
    title: 'Kami periksa barangnya',
    description: 'Tim kami menentukan layanan dan harga setelah melihat kondisi setiap barang.',
    note: 'Anda tidak perlu memilih layanan.',
  },
  {
    title: 'Bayar, lalu kami cuci',
    description:
      'Tagihan dikirim via WhatsApp. Bayar dengan scan QRIS dari aplikasi pembayaran apa pun.',
  },
  {
    title: 'Kami antar kembali',
    description: 'Pantau statusnya kapan saja dari akun Anda.',
  },
]

export default function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      className="mx-auto flex max-w-6xl scroll-mt-4 flex-col gap-5 px-5 pt-12 pb-2"
    >
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Cara kerjanya</h2>
      <ol className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
              {index + 1}
            </span>
            <div className="flex flex-col gap-2.5">
              <div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-foreground/80">{step.description}</p>
              </div>
              {step.note && (
                <Note
                  tone="attention"
                  icon={<IconRosetteDiscountCheck className="mt-0.5 size-4.5 shrink-0" />}
                >
                  {step.note}
                </Note>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
