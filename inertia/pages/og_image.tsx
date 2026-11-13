import { IconTruckDelivery } from '@tabler/icons-react'
import Logo from '~/components/atoms/logo'

// Development-only page (/_preview/og) captured at 1200 × 630 as public/images/og.png, the link
// preview image of the public pages (GUEST-3).
const STEPS = [
  'Pesan penjemputan',
  'Kami periksa barangnya',
  'Bayar, lalu kami cuci',
  'Kami antar kembali',
]

export default function OgImage() {
  return (
    <main className="flex h-158 w-300 overflow-hidden bg-card text-foreground">
      <div className="flex flex-1 flex-col justify-between p-16">
        <div className="flex items-center justify-between">
          <Logo className="h-12" />
          <p className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-lg font-semibold text-accent-foreground">
            <IconTruckDelivery className="size-6" />
            Antar-jemput gratis · Bandung Raya
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <h1 className="text-7xl leading-none font-bold tracking-tight">
            Sepatu dan tas bersih tanpa keluar rumah.
          </h1>
          <p className="text-2xl text-foreground/80">
            Kami jemput, periksa, cuci dengan layanan yang sesuai, lalu antar kembali.
          </p>
        </div>
        <p className="text-xl font-semibold">Kota Bandung · Kota Cimahi · Kabupaten Bandung</p>
      </div>
      <div className="flex w-100 flex-col justify-center gap-5 border-l border-border bg-background p-10">
        <p className="text-base font-semibold tracking-widest text-muted-foreground uppercase">
          Cara kerjanya
        </p>
        <ol className="flex flex-col gap-4">
          {STEPS.map((step, index) => (
            <li key={step} className="flex items-center gap-4 text-xl font-semibold">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-lg text-background">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </main>
  )
}
