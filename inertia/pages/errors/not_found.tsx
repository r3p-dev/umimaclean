import { cn } from 'cn'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { IconSearchOff } from '@tabler/icons-react'
import PublicLayout from '~/components/templates/public_layout'
import { buttonVariants } from '~/components/ui/button'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-2.5 px-5 py-20 text-center">
      <Head title="Halaman tidak ditemukan" />
      <IconSearchOff className="size-8 text-muted-foreground" />
      <h1 className="text-2xl font-bold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="text-sm text-pretty text-muted-foreground">
        Alamat yang Anda buka tidak ada. Periksa kembali tautannya atau kembali ke beranda.
      </p>
      <Link route="home" className={cn(buttonVariants({ className: 'mt-2 h-11 px-4' }))}>
        Kembali ke Beranda
      </Link>
    </div>
  )
}

NotFound.layout = [PublicLayout]
