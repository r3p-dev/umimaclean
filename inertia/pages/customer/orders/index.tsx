import { useEffect, useRef, useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { IconChevronLeft, IconChevronRight, IconInbox, IconSearchOff } from '@tabler/icons-react'
import { urlFor } from '~/client'
import Overline from '~/components/atoms/overline'
import EmptyState from '~/components/molecules/empty_state'
import SearchField from '~/components/molecules/search_field'
import { OrderHistoryCards, OrderHistoryTable } from '~/components/organisms/tracking/order_history'
import AccountLayout from '~/components/templates/account_layout'
import { LinkButton } from '~/components/ui/button'
import {
  ORDER_FILTERS,
  historyQuery,
  type HistoryMeta,
  type OrderFilter,
} from '~/lib/tracking/history'
import type { OrderRecord } from '~/lib/tracking/orders'
import { orderSummary } from '~/lib/tracking/summary'
import { cn } from '~/lib/shared/utils'

export default function OrderHistoryPage({
  orders,
  meta,
  filter,
  search,
  counts,
}: {
  orders: OrderRecord[]
  meta: HistoryMeta
  filter: OrderFilter
  search: string
  counts: Record<OrderFilter, number>
}) {
  const [query, setQuery] = useState(search)
  const first = useRef(true)
  const base = urlFor('customer.orders.index')
  const summaries = orders.map(orderSummary)
  const running = summaries.filter((order) => !order.finished)
  const finished = summaries.filter((order) => order.finished)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const timer = window.setTimeout(() => {
      router.get(
        `${base}${historyQuery(filter, query.trim())}`,
        {},
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        }
      )
    }, 400)
    return () => window.clearTimeout(timer)
  }, [query, filter, base])

  return (
    <>
      <Head title="Riwayat Pesanan" />
      <div className="mx-auto box-content max-w-page px-5 pt-6 lg:pt-10">
        <h1 className="text-[28px] leading-[1.15] font-bold tracking-[-0.02em] lg:text-[34px]">
          Riwayat Pesanan
        </h1>
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Saring pesanan" className="-mx-5 overflow-x-auto px-5 lg:mx-0 lg:px-0">
            <ul className="flex gap-2">
              {ORDER_FILTERS.map((option) => {
                const isActive = option.key === filter
                return (
                  <li key={option.key}>
                    <Link
                      href={`${base}${historyQuery(option.key, search)}`}
                      preserveScroll
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'box-content inline-flex h-10 items-center gap-1.5 rounded-pill border px-3.5 text-sm leading-none font-semibold whitespace-nowrap no-underline hover:no-underline',
                        isActive
                          ? 'border-surface-inverse bg-surface-inverse text-surface-inverse-foreground hover:text-surface-inverse-foreground'
                          : 'border-border-strong bg-card text-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {option.label}
                      <span
                        className={
                          isActive ? 'text-surface-inverse-muted' : 'text-muted-foreground'
                        }
                      >
                        {counts[option.key]}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <SearchField
            label="Cari nomor pesanan"
            placeholder="Cari nomor pesanan"
            value={query}
            onChange={setQuery}
            className="lg:max-w-75 lg:flex-none"
          />
        </div>
        <div className="mt-5">
          {orders.length === 0 ? (
            <section className="rounded-lg border border-border bg-card p-6">
              {search ? (
                <EmptyState
                  icon={IconSearchOff}
                  title="Pesanan tidak ditemukan"
                  description={`Tidak ada pesanan dengan nomor yang memuat "${search}".`}
                />
              ) : (
                <EmptyState
                  icon={IconInbox}
                  title="Belum ada pesanan di sini"
                  description="Pesanan Anda akan muncul di halaman ini."
                  action={
                    <LinkButton href={urlFor('customer.order.create')} className="mt-2 px-5">
                      Pesan Penjemputan
                    </LinkButton>
                  }
                />
              )}
            </section>
          ) : (
            <>
              <div className="flex flex-col gap-5 sm:hidden">
                {filter === 'semua' && running.length > 0 && finished.length > 0 ? (
                  <>
                    <section className="flex flex-col gap-2.5">
                      <Overline as="h2">Berjalan · {running.length}</Overline>
                      <OrderHistoryCards orders={running} />
                    </section>
                    <section className="flex flex-col gap-2.5">
                      <Overline as="h2">Sebelumnya</Overline>
                      <OrderHistoryCards orders={finished} />
                    </section>
                  </>
                ) : (
                  <OrderHistoryCards orders={summaries} />
                )}
              </div>
              <div className="max-sm:hidden">
                <OrderHistoryTable orders={summaries} />
              </div>
            </>
          )}
        </div>
        {meta.lastPage > 1 && (
          <nav
            aria-label="Halaman riwayat"
            className="mt-4 flex items-center justify-between gap-3 text-sm text-foreground-secondary"
          >
            <span>
              Halaman {meta.currentPage} dari {meta.lastPage} · {meta.total} pesanan
            </span>
            <span className="flex gap-2">
              <LinkButton
                variant="outline"
                size="icon-compact"
                aria-label="Halaman sebelumnya"
                isDisabled={meta.currentPage <= 1}
                href={`${base}${historyQuery(filter, search, meta.currentPage - 1)}`}
              >
                <IconChevronLeft className="size-5" />
              </LinkButton>
              <LinkButton
                variant="outline"
                size="icon-compact"
                aria-label="Halaman berikutnya"
                isDisabled={meta.currentPage >= meta.lastPage}
                href={`${base}${historyQuery(filter, search, meta.currentPage + 1)}`}
              >
                <IconChevronRight className="size-5" />
              </LinkButton>
            </span>
          </nav>
        )}
      </div>
    </>
  )
}

OrderHistoryPage.layout = [AccountLayout]
