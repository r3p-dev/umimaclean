import { Head } from '@inertiajs/react'
import { urlFor } from '~/client'
import { IconSearchOff } from '@tabler/icons-react'
import CustomerLayout from '~/components/templates/customer_layout'
import { LinkButton } from '~/components/ui/button'

export default function NotFound() {
  return (
    <>
      <Head title="Halaman tidak ditemukan" />
      <div className="mx-auto flex max-w-110 flex-col items-center gap-2.5 px-5 py-20 text-center">
        <IconSearchOff className="size-8 text-icon-muted" />
        <h1 className="text-h1">Halaman tidak ditemukan</h1>
        <p className="text-sm text-pretty text-muted-foreground">
          Alamat yang Anda buka tidak ada. Periksa kembali tautannya atau kembali ke beranda.
        </p>
        <LinkButton size="desktop" className="mt-2" href={urlFor('home')}>
          Kembali ke Beranda
        </LinkButton>
      </div>
    </>
  )
}

NotFound.layout = [CustomerLayout]
