import type { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { IconArrowDownLeft, IconArrowUpRight, IconWashMachine } from '@tabler/icons-react'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'

// Development-only preview of the staff template (routes under /_preview); the staff home in M2 replaces it.
const QUEUES = [
  { label: 'Jemput', icon: IconArrowUpRight },
  { label: 'Proses', icon: IconWashMachine },
  { label: 'Antar', icon: IconArrowDownLeft },
]

export default function StaffTemplatePreview() {
  return (
    <>
      <Head title="Pratinjau template staf" />
      <StaffTopBar title="Beranda" meta="Pratinjau" />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-5 py-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Selamat datang</h2>
          <p className="text-sm text-muted-foreground">Ini yang perlu dikerjakan hari ini.</p>
        </div>
        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Tugas berikutnya
        </h3>
        <ul className="grid grid-cols-3 gap-3">
          {QUEUES.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <span className="text-2xl font-bold">0</span>
              <span className="text-sm font-semibold">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

StaffTemplatePreview.layout = (page: ReactNode) => (
  <StaffLayout active="beranda">{page}</StaffLayout>
)
