import { useEffect, useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { IconCheck, IconKey } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { LinkButton } from '~/components/ui/button'
import InfoNote from '~/components/molecules/info_note'
import OrderNumberCard from '~/components/molecules/order_number_card'
import OrderNextSteps from '~/components/organisms/order/order_next_steps'
import FlowLayout from '~/components/templates/flow_layout'
import { formatSchedule } from '~/lib/order/schedule'
import { lastPlacedOrder } from '~/lib/tracking/orders'
import { ORDER_STATUSES } from '~/lib/tracking/status'

export default function OrderCreated() {
  const [order] = useState(lastPlacedOrder)

  useEffect(() => {
    if (!order) router.visit(urlFor('home'), { replace: true })
  }, [order])

  if (!order) return null

  return (
    <div className="min-h-screen bg-card">
      <Head title="Pesanan Dibuat" />
      <div className="mx-auto box-content max-w-page px-5">
        <div className="flex flex-col items-start gap-3.5 pt-11 pb-6">
          <span className="grid size-14 place-items-center rounded-full bg-success text-success-foreground">
            <IconCheck className="size-8" />
          </span>
          <h1 className="text-[clamp(28px,calc(22px+1vw),36px)] leading-[1.15] font-bold tracking-[-0.02em]">
            Pesanan dibuat
          </h1>
          <p className="text-base leading-normal text-foreground-secondary">
            Kurir akan menjemput{' '}
            <strong className="font-semibold text-foreground">
              {formatSchedule(order.pickupDate, order.pickupSlot, 'mid')}
            </strong>{' '}
            di {order.address.split(',')[0]}.
          </p>
        </div>
        <OrderNumberCard number={order.number} status={ORDER_STATUSES[order.status]} />
        <OrderNextSteps />
        <InfoNote icon={IconKey} className="mt-6 sm:max-w-190">
          Untuk melacak dari perangkat lain, buka{' '}
          <strong className="font-semibold text-foreground">Lacak Pesanan</strong> dan masukkan
          nomor WhatsApp Anda. Kami kirim kode verifikasi.
        </InfoNote>
        <div className="flex flex-col gap-2.5 pt-6 pb-7 sm:flex-row sm:items-center">
          <LinkButton
            size="cta"
            className="sm:w-auto sm:min-w-74 sm:flex-none sm:px-7"
            href={urlFor('tracking.status', { number: order.number })}
          >
            Lacak Pesanan
          </LinkButton>
          <LinkButton
            variant="ghost"
            size="cta"
            className="h-14 border border-input sm:w-auto sm:min-w-74.5 sm:flex-none sm:px-7"
            href={urlFor('home')}
          >
            Kembali ke Beranda
          </LinkButton>
        </div>
      </div>
    </div>
  )
}

OrderCreated.layout = [FlowLayout]
