import type { ReactNode } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { IconChartBar, IconHistory } from '@tabler/icons-react'
import OwnerPageHeader from '~/components/organisms/owner_page_header'
import OwnerLayout from '~/components/templates/owner_layout'

const METRICS = [
  { label: 'Omzet hari ini', value: 'Rp0' },
  { label: 'Transaksi lunas', value: '0' },
  { label: 'Rata-rata per pesanan', value: 'Rp0' },
  { label: 'Laba bersih', value: 'Rp0' },
]

export default function AdminDashboard() {
  const user = usePage().props.user
  const firstName = user?.fullName.split(' ')[0] ?? 'Pemilik'

  return (
    <>
      <Head title="Ringkasan Pemilik" />
      <OwnerPageHeader title="Ringkasan" status="Aktif" />

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Selamat datang, {firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan pendapatan dan performa operasional Umima Clean hari ini.
          </p>
        </div>

        <section aria-labelledby="heading-metrik">
          <h2 id="heading-metrik" className="sr-only">
            Metrik Keuangan Hari Ini
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map(({ label, value }) => (
              <li
                key={label}
                className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-xs"
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-sm font-medium">{label}</span>
                  <IconChartBar className="size-4.5" />
                </div>
                <span className="text-2xl font-bold tracking-tight">{value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="heading-aktivitas"
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <IconHistory className="size-6" />
          </div>
          <h2 id="heading-aktivitas" className="text-base font-semibold">
            Belum ada aktivitas hari ini
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Aktivitas tim operasional dan transaksi pesanan terbaru akan tercatat dan muncul di
            sini.
          </p>
        </section>
      </div>
    </>
  )
}

AdminDashboard.layout = (page: ReactNode) => (
  <OwnerLayout active="ringkasan" title="Ringkasan">
    {page}
  </OwnerLayout>
)
