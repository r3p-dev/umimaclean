import { useState } from 'react'
import { Head } from '@inertiajs/react'
import { IconSearchOff } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { LinkButton } from '~/components/ui/button'
import BackLink from '~/components/molecules/back_link'
import EmptyState from '~/components/molecules/empty_state'
import DemoSwitcher from '~/components/organisms/demo_switcher'
import FlowHeader from '~/components/organisms/flow_header'
import ActionCard from '~/components/organisms/tracking/action_card'
import OrderInfoPanel from '~/components/organisms/tracking/order_info_panel'
import StatusHistory from '~/components/organisms/tracking/status_history'
import StatusTabs, { type StatusTab } from '~/components/organisms/tracking/status_tabs'
import TrackingHero from '~/components/organisms/tracking/tracking_hero'
import FlowLayout from '~/components/templates/flow_layout'
import { useOrderAccess } from '~/lib/tracking/access'
import { ORDER_STATUSES, buildTracking } from '~/lib/tracking/status'
import { cn } from '~/lib/shared/utils'

export default function TrackingStatus({ number }: { number: string }) {
  const { order, allowed } = useOrderAccess(number)
  const [statusIndex, setStatusIndex] = useState(order?.status ?? 0)
  const [tab, setTab] = useState<StatusTab>('riwayat')

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Head title="Pesanan tidak ditemukan" />
        <FlowHeader title="Lacak Pesanan" className="bg-card" />
        <EmptyState
          icon={IconSearchOff}
          title="Pesanan tidak ditemukan"
          description={`Nomor ${number} tidak terdaftar. Periksa kembali nomor pesanan Anda.`}
          className="py-16"
          action={
            <LinkButton
              variant="outline"
              size="desktop"
              className="mt-2"
              href={urlFor('tracking.orders')}
            >
              Lihat Pesanan Anda
            </LinkButton>
          }
        />
      </div>
    )
  }

  if (!allowed) return null

  const view = buildTracking(order, statusIndex)

  return (
    <div className="min-h-screen bg-background">
      <Head title={`${order.number} · ${view.status}`} />
      <FlowHeader
        title={order.number}
        showLogo={false}
        titleClassName="font-mono text-[15px] leading-none"
        className="bg-card"
        actions={
          <BackLink
            href={urlFor('tracking.orders')}
            label="Pesanan Anda"
            className="-mr-3 ml-0 self-auto"
          />
        }
      >
        <TrackingHero view={view} />
      </FlowHeader>
      <div className="mx-auto box-content flex max-w-page flex-col items-start gap-3 px-5 py-4 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-6">
        <div className="flex w-full min-w-0 flex-col gap-3">
          <ActionCard
            needsPay={view.needsPay}
            number={order.number}
            total={view.total}
            onShowDetails={() => setTab('rincian')}
          />
          <StatusTabs value={tab} onChange={setTab} />
          <StatusHistory
            id="panel-riwayat"
            view={view}
            className={cn(tab !== 'riwayat' && 'max-lg:hidden')}
          />
        </div>
        <OrderInfoPanel
          id="panel-rincian"
          order={order}
          view={view}
          className={cn(tab !== 'rincian' && 'max-lg:hidden')}
        />
      </div>
      {order.demo && (
        <DemoSwitcher
          label="Ubah status pesanan (demo)"
          options={ORDER_STATUSES.map((label, index) => ({ value: index, label }))}
          value={statusIndex}
          onChange={setStatusIndex}
        />
      )}
    </div>
  )
}

TrackingStatus.layout = [FlowLayout]
