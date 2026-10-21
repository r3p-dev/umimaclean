import { IconQrcode } from '@tabler/icons-react'
import { urlFor } from '~/client'
import Overline from '~/components/atoms/overline'
import StatusBadge from '~/components/atoms/status_badge'
import PhaseProgress from '~/components/molecules/phase_progress'
import { LinkButton } from '~/components/ui/button'
import { formatDate } from '~/lib/shared/date'
import type { OrderRecord } from '~/lib/tracking/orders'
import { buildTracking } from '~/lib/tracking/status'

export default function ActiveOrderPanel({ order }: { order: OrderRecord }) {
  const view = buildTracking(order)

  return (
    <section
      aria-labelledby="active-order-title"
      className="flex flex-col gap-3.5 rounded-lg border border-border bg-card p-4 shadow-1 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <Overline as="h2" id="active-order-title">
          Pesanan aktif
        </Overline>
        <StatusBadge status={view.status} />
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-[17px] leading-none font-semibold">{order.number}</span>
          <span className="text-sm leading-[1.4] text-foreground-secondary">
            {view.itemsSummary}
            {order.pickupDate && (
              <span className="max-sm:hidden">
                {' '}
                · dijemput {formatDate(order.pickupDate, 'short')}
              </span>
            )}
          </span>
        </div>
        {view.total && (
          <span className="text-xl leading-none font-bold tracking-[-0.01em] tabular-nums sm:text-[28px]">
            {view.total}
          </span>
        )}
      </div>
      <PhaseProgress phases={view.phases} tone={view.tone} />
      <div className="flex flex-col gap-2.5 sm:flex-row">
        {view.needsPay && (
          <LinkButton
            href={urlFor('customer.orders.pay', { code: order.number })}
            size="desktop"
            className="gap-2 px-4 max-sm:h-btn"
          >
            <IconQrcode className="size-5" />
            Bayar dengan QRIS
          </LinkButton>
        )}
        <LinkButton
          href={urlFor('customer.orders.show', { code: order.number })}
          variant="outline"
          size="desktop"
          className="px-4 max-sm:h-btn"
        >
          Lihat detail
        </LinkButton>
      </div>
    </section>
  )
}
