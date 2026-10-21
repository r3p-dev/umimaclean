import { Link } from '@adonisjs/inertia/react'
import { IconChevronRight, IconTruckDelivery } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { LinkButton } from '~/components/ui/button'
import { shortStreet, type SavedAddress } from '~/lib/order/addresses'

export default function QuickOrderPanel({ pickup }: { pickup: SavedAddress | null }) {
  const where = pickup
    ? `Dijemput di ${pickup.label} · ${shortStreet(pickup.addressText)}`
    : 'Tambahkan alamat jemput saat memesan.'

  return (
    <>
      <Link
        route="customer.order.create"
        className="flex items-center gap-3.5 rounded-lg border border-border bg-card p-4 text-foreground no-underline hover:bg-row-hover hover:text-foreground hover:no-underline sm:hidden"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-accent text-info-foreground">
          <IconTruckDelivery className="size-6" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-base leading-[1.3] font-semibold">Pesan penjemputan</span>
          <span className="truncate text-sm leading-[1.3] text-foreground-secondary">{where}</span>
        </span>
        <IconChevronRight className="size-5 text-foreground-secondary" />
      </Link>
      <section
        aria-labelledby="quick-order-title"
        className="hidden flex-col items-start gap-3 rounded-lg border border-border bg-card p-5 sm:flex"
      >
        <span className="flex size-12 items-center justify-center rounded-md bg-accent text-info-foreground">
          <IconTruckDelivery className="size-6" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 id="quick-order-title" className="text-lg leading-[1.3] font-semibold">
            Ada yang mau dicuci lagi?
          </h2>
          <p className="text-sm leading-[1.4] text-foreground-secondary">{where}</p>
        </div>
        <LinkButton href={urlFor('customer.order.create')} className="mt-1 w-full">
          Pesan Penjemputan
        </LinkButton>
      </section>
    </>
  )
}
