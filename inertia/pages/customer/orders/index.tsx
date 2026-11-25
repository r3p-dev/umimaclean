import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconChevronLeft,
  IconChevronRight,
  IconCirclePlus,
  IconInbox,
  IconSearch,
  IconSearchOff,
} from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { cn } from 'cn'
import { urlFor } from '~/client'
import OrderStatusBadge from '~/components/atoms/order_status_badge'
import CustomerLayout from '~/components/templates/customer_layout'
import { buttonVariants } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { formatPickupDate, formatSlotTime } from '~/lib/order_format'
import { formatCreatedDateId, itemsSummaryText } from '~/lib/order_status'

type OrderFilter = 'semua' | 'aktif' | 'selesai' | 'dibatalkan'

const FILTER_OPTIONS: readonly { key: OrderFilter; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'aktif', label: 'Aktif' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'dibatalkan', label: 'Dibatalkan' },
]

function listUrl(filter: OrderFilter, search: string, page = 1) {
  const params = new URLSearchParams()
  if (filter !== 'semua') {
    params.set('status', filter)
  }
  if (search) {
    params.set('q', search)
  }
  if (page > 1) {
    params.set('page', String(page))
  }
  const query = params.toString()
  const base = urlFor('customer.orders.index')
  return query ? `${base}?${query}` : base
}

export default function CustomerOrdersIndex({
  orders,
  meta,
  filter,
  search,
  counts,
}: {
  orders: Data.OrderSummary[]
  meta: { currentPage: number; lastPage: number; total: number }
  filter: OrderFilter
  search: string
  counts: Record<OrderFilter, number>
}) {
  const [query, setQuery] = useState(search)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = window.setTimeout(() => {
      router.get(
        listUrl(filter, query.trim()),
        {},
        { preserveState: true, preserveScroll: true, replace: true }
      )
    }, 350)
    return () => window.clearTimeout(timer)
  }, [query, filter])

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 pt-6 sm:pt-8">
      <Head title="Pesanan Saya" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pesanan Saya</h1>
        <Link
          route="customer.orders.create"
          className={buttonVariants({ className: 'min-h-11 gap-2 px-4 text-base' })}
        >
          <IconCirclePlus aria-hidden="true" className="size-5" />
          Pesan penjemputan
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Saring pesanan" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <ul className="flex gap-2">
            {FILTER_OPTIONS.map((option) => {
              const isActive = option.key === filter
              return (
                <li key={option.key}>
                  <Link
                    href={listUrl(option.key, search)}
                    preserveScroll
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors',
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:bg-muted'
                    )}
                  >
                    {option.label}
                    <span
                      className={cn(
                        'text-xs tabular-nums',
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      )}
                    >
                      {counts[option.key]}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="relative w-full sm:max-w-64">
          <label htmlFor="search-order" className="sr-only">
            Cari nomor pesanan
          </label>
          <IconSearch
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="search-order"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nomor pesanan (UMC-...)"
            className="min-h-11 pl-9 text-base"
          />
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              {search ? (
                <IconSearchOff aria-hidden="true" className="size-7" />
              ) : (
                <IconInbox aria-hidden="true" className="size-7" />
              )}
            </div>
            <h2 className="text-lg font-semibold">
              {search ? 'Pesanan tidak ditemukan' : 'Belum ada pesanan di sini'}
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              {search
                ? `Tidak ada pesanan dengan nomor yang memuat "${search}".`
                : 'Pesanan yang Anda buat akan muncul di halaman ini.'}
            </p>
            {!search && (
              <Link
                route="customer.orders.create"
                className={buttonVariants({ className: 'mt-2 min-h-11 px-5' })}
              >
                Pesan Penjemputan
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                route="customer.orders.show"
                routeParams={{ id: order.id }}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-base font-semibold">{order.number}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>{itemsSummaryText(order.items)}</span>
                  <span>Dibuat {formatCreatedDateId(order.createdAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Penjemputan: {formatPickupDate(order.pickupDate)},{' '}
                  {formatSlotTime(order.pickupStartsAt, order.pickupEndsAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {meta.lastPage > 1 && (
        <nav
          aria-label="Halaman pesanan"
          className="flex items-center justify-between gap-3 text-sm text-muted-foreground"
        >
          <span>
            Halaman {meta.currentPage} dari {meta.lastPage} · {meta.total} pesanan
          </span>
          <span className="flex gap-2">
            <Link
              href={listUrl(filter, search, Math.max(1, meta.currentPage - 1))}
              aria-label="Halaman sebelumnya"
              aria-disabled={meta.currentPage <= 1}
              className={buttonVariants({
                variant: 'outline',
                size: 'icon',
                className: cn('size-11', meta.currentPage <= 1 && 'pointer-events-none opacity-50'),
              })}
            >
              <IconChevronLeft aria-hidden="true" className="size-5" />
            </Link>
            <Link
              href={listUrl(filter, search, Math.min(meta.lastPage, meta.currentPage + 1))}
              aria-label="Halaman berikutnya"
              aria-disabled={meta.currentPage >= meta.lastPage}
              className={buttonVariants({
                variant: 'outline',
                size: 'icon',
                className: cn(
                  'size-11',
                  meta.currentPage >= meta.lastPage && 'pointer-events-none opacity-50'
                ),
              })}
            >
              <IconChevronRight aria-hidden="true" className="size-5" />
            </Link>
          </span>
        </nav>
      )}
    </div>
  )
}

CustomerOrdersIndex.layout = (page: ReactNode) => (
  <CustomerLayout active="riwayat">{page}</CustomerLayout>
)
