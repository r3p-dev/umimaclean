import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { IconArrowRight, IconClock, IconTruckDelivery } from '@tabler/icons-react'
import { cn } from 'cn'
import Photo from '~/components/atoms/photo'
import AreaCheckForm from '~/components/molecules/area_check_form'
import CompareSlider from '~/components/molecules/compare_slider'
import { Badge } from '~/components/ui/badge'
import { buttonVariants } from '~/components/ui/button'

const PHOTO = {
  widths: [640, 1100],
  sizes: '(min-width: 640px) 50vw, 100vw',
  className: 'absolute inset-0 size-full object-cover',
}

export default function Hero() {
  const { openingHours } = usePage().props

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pt-8 pb-6 sm:grid-cols-2 sm:pt-12">
      <div className="flex flex-col gap-5">
        <Badge
          variant="accent"
          className="h-auto gap-2 self-start rounded-full px-3 py-1.5 text-sm font-semibold"
        >
          <IconTruckDelivery className="size-4.5" />
          Antar-jemput gratis · Bandung Raya
        </Badge>
        {openingHours && (
          <p className="flex items-start gap-2 text-sm font-medium text-foreground">
            <IconClock className="mt-0.5 size-4 shrink-0" />
            <span>
              {openingHours.status.label}
              {openingHours.status.note && ` (${openingHours.status.note})`}
            </span>
          </p>
        )}
        <h1 className="text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl lg:leading-none">
          Sepatu dan tas bersih tanpa keluar rumah.
        </h1>
        <p className="max-w-xl text-lg text-pretty text-foreground/80">
          Kami jemput barang Anda, periksa kondisinya, lalu cuci dengan layanan yang paling sesuai.
          Setelah bersih, kami antar kembali.
        </p>
        <div className="flex flex-col gap-3 sm:items-start">
          <Link
            route="register.create"
            className={cn(buttonVariants({ className: 'h-14 gap-2 px-7 text-base sm:w-auto' }))}
          >
            Pesan Penjemputan
            <IconArrowRight className="size-5" />
          </Link>
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            Sudah punya akun?{' '}
            <Link route="session.create" className="font-semibold text-primary hover:underline">
              Masuk
            </Link>
          </p>
        </div>
        <AreaCheckForm />
      </div>

      <CompareSlider
        className="aspect-square shadow-lg"
        before={
          <Photo
            {...PHOTO}
            src="/images/landing/shoes-before"
            alt="Sepasang sepatu putih berlumpur, sebelum dicuci"
          />
        }
        after={
          <Photo
            {...PHOTO}
            src="/images/landing/shoes-after"
            alt="Sepasang sepatu putih yang bersih, sesudah dicuci"
          />
        }
      />
    </section>
  )
}
