import { Link } from '@adonisjs/inertia/react'
import { IconChevronRight, IconTruckDelivery } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { LinkButton } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { shortStreet, type SavedAddress } from '~/lib/order/addresses'

export default function QuickOrderPanel({ pickup }: { pickup: SavedAddress | null }) {
  const where = pickup
    ? `Dijemput di ${pickup.label} · ${shortStreet(pickup.addressText)}`
    : 'Tambahkan alamat jemput saat memesan.'

  return (
    <>
      <Link
        route="customer.order.create"
        className="flex items-center gap-3.5 rounded-lg border border-border bg-card p-5 text-foreground no-underline hover:bg-row-hover hover:text-foreground hover:no-underline sm:hidden"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-accent text-info-foreground">
          <IconTruckDelivery className="size-6" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-md font-semibold">Pesan penjemputan</span>
          <span className="truncate text-meta text-muted-foreground">{where}</span>
        </span>
        <IconChevronRight className="size-5 text-foreground-secondary" />
      </Link>
      <Card role="region" aria-labelledby="quick-order-title" className="hidden sm:flex">
        <CardContent>
          <span className="flex size-12 items-center justify-center rounded-md bg-accent text-info-foreground">
            <IconTruckDelivery className="size-6" />
          </span>
        </CardContent>
        <CardHeader>
          <CardTitle as="h2" id="quick-order-title">
            Ada yang mau dicuci lagi?
          </CardTitle>
          <CardDescription>{where}</CardDescription>
        </CardHeader>
        <CardFooter>
          <LinkButton href={urlFor('customer.order.create')} className="w-full">
            Pesan Penjemputan
          </LinkButton>
        </CardFooter>
      </Card>
    </>
  )
}
