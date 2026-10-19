import { IconArrowRight, IconTruckDelivery } from '@tabler/icons-react'
import { Badge } from '~/components/ui/badge'
import CompareSlider from '~/components/molecules/compare_slider'
import { LinkButton } from '~/components/ui/button'
import { urlFor } from '~/client'

export default function Hero() {
  return (
    <section className="mx-auto box-content grid max-w-page items-center gap-7 px-5 pt-7 pb-6 sm:grid-cols-2">
      <div className="flex flex-col gap-4.5">
        <Badge variant="info" size="lg" className="self-start">
          <IconTruckDelivery />
          Antar-jemput · Bandung Raya
        </Badge>

        <h1 className="text-display text-balance">
          Sepatu, tas, dan helm bersih tanpa keluar rumah.
        </h1>

        <p className="max-w-130 text-lead text-pretty text-foreground-secondary">
          Kami jemput barang Anda, periksa kondisinya, lalu cuci dengan layanan yang paling sesuai.
          Setelah bersih, kami antar kembali.
        </p>

        <div className="flex flex-col gap-2.5 sm:items-start">
          <LinkButton
            size="cta"
            className="sm:w-auto sm:min-w-74 sm:px-7"
            href={urlFor('order.details')}
          >
            Pesan Penjemputan
            <IconArrowRight />
          </LinkButton>

          <p className="text-center text-meta text-muted-foreground sm:text-left">
            Tanpa daftar akun. Cukup nama, nomor WhatsApp, dan alamat.
          </p>
        </div>
      </div>

      <div className="relative box-content aspect-16/11 p-3">
        <CompareSlider
          before="https://images.unsplash.com/photo-1601574260493-7b8af92b36db?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
          after="https://images.unsplash.com/photo-1654147801991-a9fa8594e900?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
          className="absolute inset-0 shadow-lg"
        />
      </div>
    </section>
  )
}
