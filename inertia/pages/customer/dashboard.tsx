import type { ReactNode } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { IconArchive } from '@tabler/icons-react'
import CustomerLayout from '~/components/templates/customer_layout'

export default function Dashboard() {
  const user = usePage().props.user
  const firstName = user?.fullName.split(' ')[0] ?? ''

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 pt-10">
      <Head title="Beranda" />
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Selamat datang, {firstName}</h1>
        <p className="mt-2 text-base text-muted-foreground">Akun Anda siap.</p>
      </div>
      <section className="flex max-w-sm flex-col items-center gap-2 rounded-xl border border-border bg-card px-6 py-8 text-center">
        <IconArchive className="size-7 text-muted-foreground" />
        <h2 className="text-base font-semibold">Belum ada pesanan</h2>
        <p className="text-sm text-muted-foreground">
          Pesanan aktif dan riwayat akan muncul di sini setelah Anda memesan.
        </p>
      </section>
    </div>
  )
}

Dashboard.layout = (page: ReactNode) => <CustomerLayout active="beranda">{page}</CustomerLayout>
