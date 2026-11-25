import type { ReactNode } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconArchive,
  IconCheck,
  IconChevronRight,
  IconCirclePlus,
  IconMapPin,
  IconRefresh,
  IconTruckDelivery,
} from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { cn } from 'cn'
import { urlFor } from '~/client'
import OrderStatusBadge from '~/components/atoms/order_status_badge'
import OrderStageProgress from '~/components/molecules/order_stage_progress'
import CustomerLayout from '~/components/templates/customer_layout'
import { buttonVariants } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { formatPickupDate } from '~/lib/order_format'
import { formatCreatedDateId, itemsSummaryText } from '~/lib/order_status'

function greetingForNow() {
  const hour = new Date().getHours()
  if (hour < 11) {
    return 'Selamat pagi'
  }
  if (hour < 15) {
    return 'Selamat siang'
  }
  if (hour < 18) {
    return 'Selamat sore'
  }
  return 'Selamat malam'
}

function QuickOrderPanel({ primaryAddress }: { primaryAddress: Data.Address | null }) {
  const where = primaryAddress
    ? `Dijemput di ${primaryAddress.label} · ${primaryAddress.addressText}`
    : 'Tambahkan alamat jemput saat memesan.'

  return (
    <>
      <Link
        route="customer.orders.create"
        className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-5 text-foreground transition-colors hover:bg-muted/50 lg:hidden"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
          <IconTruckDelivery aria-hidden="true" className="size-6" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-base font-semibold">Pesan penjemputan</span>
          <span className="truncate text-sm text-muted-foreground">{where}</span>
        </span>
        <IconChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
      </Link>
      <Card role="region" aria-labelledby="quick-order-title" className="hidden lg:flex">
        <CardHeader>
          <span className="mb-2 flex size-12 items-center justify-center rounded-lg bg-accent text-primary">
            <IconTruckDelivery aria-hidden="true" className="size-6" />
          </span>
          <CardTitle id="quick-order-title">
            <h2>Ada yang mau dicuci lagi?</h2>
          </CardTitle>
          <CardDescription className="line-clamp-2">{where}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            route="customer.orders.create"
            className={buttonVariants({ className: 'min-h-11 w-full gap-2 text-base' })}
          >
            <IconCirclePlus aria-hidden="true" className="size-5" />
            Pesan penjemputan
          </Link>
        </CardFooter>
      </Card>
    </>
  )
}

function WelcomeDashboard({
  firstName,
  primaryAddress,
}: {
  firstName: string
  primaryAddress: Data.Address | null
}) {
  const steps = [
    {
      title: 'Simpan alamat jemput',
      text: 'Isi sekali, dipakai otomatis setiap pesan.',
      done: Boolean(primaryAddress),
      action: { label: 'Tambah alamat', href: urlFor('customer.addresses.create') },
    },
    {
      title: 'Pesan penjemputan pertama',
      text: 'Pilih barang dan jadwal, kurir datang ke alamat Anda.',
      done: false,
      action: { label: 'Pesan sekarang', href: urlFor('customer.orders.create') },
    },
    {
      title: 'Bayar setelah tahu harganya',
      text: 'Tagihan muncul di sini dan via WhatsApp setelah barang diperiksa.',
      done: false,
      action: null,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-5 pt-6 lg:pt-10">
      <Head title="Beranda" />
      <p className="text-sm font-semibold text-emerald-700 lg:hidden">Akun Anda siap</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight lg:mt-0 lg:text-3xl">
        Selamat datang, {firstName}
      </h1>
      <p className="mt-2 text-base text-muted-foreground max-lg:hidden">
        Akun Anda siap. Berikut cara memulai.
      </p>

      <div className="mt-5 grid grid-cols-1 items-start gap-4 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <div className="flex flex-col gap-4 lg:gap-6">
          <Card
            role="region"
            aria-labelledby="first-order-title"
            className="sm:flex-row sm:items-center sm:justify-between"
          >
            <CardHeader className="sm:flex-1">
              <div className="flex items-start gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-accent text-primary sm:size-16">
                  <IconTruckDelivery aria-hidden="true" className="size-7" />
                </span>
                <div className="flex flex-col gap-1">
                  <CardTitle id="first-order-title" className="text-xl font-bold">
                    <h2>Pesan penjemputan pertama Anda</h2>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Kurir menjemput sepatu atau tas Anda. Bayar setelah tahu harganya.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="sm:shrink-0">
              <Link
                route="customer.orders.create"
                className={buttonVariants({
                  className: 'min-h-11 w-full px-6 text-base sm:w-auto',
                })}
              >
                Pesan penjemputan
              </Link>
            </CardFooter>
          </Card>

          <Card role="region" aria-labelledby="start-steps-title">
            <CardHeader>
              <CardTitle id="start-steps-title" className="text-lg">
                <h2>Mulai dalam 3 langkah</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="divide-y divide-border">
                {steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0"
                  >
                    <span
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                        step.done
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-border text-muted-foreground'
                      )}
                    >
                      {step.done ? <IconCheck aria-hidden="true" className="size-5" /> : index + 1}
                      <span className="sr-only">{step.done ? ' (selesai)' : ''}</span>
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-base font-semibold">{step.title}</span>
                      <span className="text-sm text-muted-foreground">{step.text}</span>
                    </span>
                    {step.action && !step.done && (
                      <Link
                        href={step.action.href}
                        className={buttonVariants({
                          variant: 'outline',
                          size: 'sm',
                          className: 'min-h-11 shrink-0 px-3',
                        })}
                      >
                        {step.action.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <IconArchive aria-hidden="true" className="size-7" />
              </div>
              <h2 className="text-lg font-semibold">Belum ada pesanan</h2>
              <p className="text-sm text-muted-foreground">
                Pesanan aktif dan riwayat akan muncul di sini setelah Anda memesan.
              </p>
            </CardContent>
          </Card>
          <Link
            route="customer.addresses.index"
            className="flex min-h-14 items-center gap-3 rounded-xl bg-muted px-5 text-base font-medium text-foreground transition-colors hover:bg-accent"
          >
            <IconMapPin aria-hidden="true" className="size-5 text-muted-foreground" />
            <span className="flex-1">Atur alamat penjemputan</span>
            <IconChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
          </Link>
        </aside>
      </div>
    </div>
  )
}

export default function CustomerDashboard({
  totalOrders,
  activeOrder,
  activeOrderCount,
  recentOrders,
  primaryAddress,
  addressLabels,
}: {
  totalOrders: number
  activeOrder: Data.OrderSummary | null
  activeOrderCount: number
  recentOrders: Data.OrderSummary[]
  primaryAddress: Data.Address | null
  addressLabels: string[]
}) {
  const user = usePage().props.user
  const firstName = user?.fullName.split(' ')[0] ?? 'Pelanggan'

  if (totalOrders === 0) {
    return <WelcomeDashboard firstName={firstName} primaryAddress={primaryAddress} />
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pt-6 lg:pt-10">
      <Head title="Beranda" />
      <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
        <span className="mb-1 block text-base font-medium tracking-normal text-muted-foreground lg:hidden">
          {greetingForNow()},
        </span>
        <span className="lg:hidden">{user?.fullName}</span>
        <span className="max-lg:hidden">
          {greetingForNow()}, {firstName}
        </span>
      </h1>

      <div className="mt-5 grid grid-cols-1 items-start gap-4 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <div className="flex flex-col gap-4 lg:gap-6">
          {activeOrder && (
            <Card role="region" aria-labelledby="active-order-title">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle id="active-order-title" className="text-lg">
                  <h2>Pesanan aktif</h2>
                </CardTitle>
                <OrderStatusBadge status={activeOrder.status} />
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-base font-semibold">{activeOrder.number}</span>
                  <span className="text-sm text-muted-foreground">
                    {itemsSummaryText(activeOrder.items)}
                    <span className="max-sm:hidden">
                      {' '}
                      · dijemput {formatPickupDate(activeOrder.pickupDate)}
                    </span>
                  </span>
                </div>
                <OrderStageProgress status={activeOrder.status} />
              </CardContent>
              <CardFooter className="flex flex-wrap items-center gap-3">
                <Link
                  route="customer.orders.show"
                  routeParams={{ id: activeOrder.id }}
                  className={buttonVariants({
                    variant: 'outline',
                    className: 'min-h-11 w-full px-4 sm:w-auto',
                  })}
                >
                  Lihat detail
                </Link>
                {activeOrderCount > 1 && (
                  <Link
                    route="customer.orders.index"
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
                  >
                    Lihat semua pesanan ({activeOrderCount})
                  </Link>
                )}
              </CardFooter>
            </Card>
          )}

          <div className="lg:hidden">
            <QuickOrderPanel primaryAddress={primaryAddress} />
          </div>

          {recentOrders.length > 0 && (
            <Card role="region" aria-labelledby="recent-orders-title">
              <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border">
                <CardTitle id="recent-orders-title" className="text-lg">
                  <h2>Terakhir selesai</h2>
                </CardTitle>
                <Link
                  route="customer.orders.index"
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
                >
                  Lihat riwayat
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {recentOrders.map((order) => (
                    <li key={order.id} className="flex items-center gap-4 px-6 py-3.5">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:grid sm:grid-cols-[110px_120px_minmax(0,1fr)] sm:items-center sm:gap-4">
                        <span className="text-xs text-muted-foreground sm:text-sm">
                          {formatCreatedDateId(order.createdAt)}
                          <span className="sm:hidden"> · {order.number}</span>
                        </span>
                        <Link
                          route="customer.orders.show"
                          routeParams={{ id: order.id }}
                          className="font-mono text-sm font-semibold text-foreground hover:underline max-sm:hidden"
                        >
                          {order.number}
                        </Link>
                        <span className="truncate text-sm font-medium sm:font-normal">
                          {itemsSummaryText(order.items)}
                        </span>
                      </div>
                      <Link
                        href={`/pesan?ulang=${order.id}`}
                        aria-label={`Pesan lagi seperti ${order.number}`}
                        className={buttonVariants({
                          variant: 'outline',
                          size: 'sm',
                          className: 'min-h-11 shrink-0 gap-1.5 px-3',
                        })}
                      >
                        <IconRefresh aria-hidden="true" className="size-4" />
                        Pesan lagi
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="hidden flex-col gap-4 lg:flex">
          <QuickOrderPanel primaryAddress={primaryAddress} />
          <Card role="region" aria-labelledby="saved-addresses-title">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle id="saved-addresses-title" className="text-lg">
                <h2>Alamat tersimpan</h2>
              </CardTitle>
              <Link
                route="customer.addresses.index"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
              >
                Atur
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {addressLabels.length > 0
                  ? addressLabels.join(' · ')
                  : 'Belum ada alamat tersimpan.'}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

CustomerDashboard.layout = (page: ReactNode) => (
  <CustomerLayout active="beranda">{page}</CustomerLayout>
)
