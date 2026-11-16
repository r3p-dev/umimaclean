import type { ReactNode } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { IconArchive } from '@tabler/icons-react'
import CustomerLayout from '~/components/templates/customer_layout'

export default function CustomerDashboard() {
  const user = usePage().props.user
  const firstName = user?.fullName.split(' ')[0] ?? 'Pelanggan'

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-5 pt-8 sm:pt-10">
      <Head title="Beranda Pelanggan" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Selamat datang, {firstName}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Pesan cuci sepatu, tas, dan helm dengan layanan antar-jemput Bandung Raya.
        </p>
      </div>

      <section
        aria-labelledby="heading-pesanan"
        className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center shadow-xs"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <IconArchive className="size-7" />
        </div>
        <h2 id="heading-pesanan" className="text-lg font-semibold">
          Belum ada pesanan aktif
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Pesanan aktif, jadwal penjemputan, dan riwayat cucian Anda akan muncul di sini setelah
          Anda membuat pesanan.
        </p>
      </section>
    </div>
  )
}

CustomerDashboard.layout = (page: ReactNode) => (
  <CustomerLayout active="beranda">{page}</CustomerLayout>
)
