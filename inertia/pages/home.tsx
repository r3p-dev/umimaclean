import { cn } from 'cn'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import PublicLayout from '~/components/templates/public_layout'
import { buttonVariants } from '~/components/ui/button'

// shortcut: a short hero until the landing sections (GUEST-1) are built in M1c, which replace this page.
export default function Home() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-20 sm:py-28">
      <Head title="Cuci sepatu, tas, dan helm di Bandung Raya" />
      <h1 className="max-w-2xl text-5xl leading-none font-bold tracking-tight text-balance sm:text-6xl">
        Sepatu dan tas bersih tanpa keluar rumah.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Kurir kami menjemput gratis di Kota Bandung, Cimahi, dan sebagian Kab. Bandung. Bayar
        setelah barang diperiksa.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          route="register.create"
          className={cn(buttonVariants({ className: 'h-12 px-5 text-base' }))}
        >
          Daftar
        </Link>
        <Link
          route="session.create"
          className={cn(buttonVariants({ variant: 'outline', className: 'h-12 px-5 text-base' }))}
        >
          Masuk
        </Link>
      </div>
    </section>
  )
}

Home.layout = [PublicLayout]
