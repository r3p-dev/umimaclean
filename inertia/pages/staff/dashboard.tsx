import type { ReactNode } from 'react'
import { Head, usePage } from '@inertiajs/react'
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconWashMachine,
  IconClipboardCheck,
} from '@tabler/icons-react'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'

const QUEUES = [
  { label: 'Jemput', count: 0, icon: IconArrowUpRight },
  { label: 'Proses', count: 0, icon: IconWashMachine },
  { label: 'Antar', count: 0, icon: IconArrowDownLeft },
]

export default function StaffDashboard() {
  const user = usePage().props.user
  const firstName = user?.fullName.split(' ')[0] ?? 'Staf'

  return (
    <>
      <Head title="Beranda Staf" />
      <StaffTopBar title="Beranda" meta="Operasional" />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Selamat bertugas, {firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan antrean tugas operasional hari ini.
          </p>
        </div>

        <section aria-labelledby="heading-antrean">
          <h2
            id="heading-antrean"
            className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
          >
            Antrean Tugas
          </h2>
          <ul className="mt-3 grid grid-cols-3 gap-3">
            {QUEUES.map(({ label, count, icon: Icon }) => (
              <li
                key={label}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </span>
                <span className="text-2xl font-bold">{count}</span>
                <span className="text-sm font-semibold">{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="heading-tugas-aktif"
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <IconClipboardCheck className="size-6" />
          </div>
          <h2 id="heading-tugas-aktif" className="text-base font-semibold">
            Belum ada tugas aktif
          </h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Pesanan yang perlu dijemput, diperiksa, dicuci, atau diantar akan muncul di antrean
            tugas.
          </p>
        </section>
      </div>
    </>
  )
}

StaffDashboard.layout = (page: ReactNode) => <StaffLayout active="beranda">{page}</StaffLayout>
