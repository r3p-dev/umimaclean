import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { IconInbox, IconLogout } from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button } from '~/components/ui/button'
import Overline from '~/components/atoms/overline'
import EmptyState from '~/components/molecules/empty_state'
import OrderCard from '~/components/molecules/order_card'
import OrderPickupButton from '~/components/molecules/order_pickup_button'
import FlowHeader from '~/components/organisms/flow_header'
import OrderHistory from '~/components/organisms/tracking/order_history'
import FlowLayout from '~/components/templates/flow_layout'
import { maskPhone } from '~/lib/shared/phone'
import { useVerifiedPhone } from '~/lib/tracking/access'
import { ordersForPhone } from '~/lib/tracking/orders'
import { orderSummary } from '~/lib/tracking/summary'
import { forgetDevice } from '~/lib/verification/session'

export default function TrackingOrders() {
  const phone = useVerifiedPhone()
  const [orders] = useState(() => (phone ? ordersForPhone(phone).map(orderSummary) : []))

  if (!phone) return null

  const active = orders.filter((order) => !order.finished)
  const history = orders.filter((order) => order.finished)

  function signOut() {
    forgetDevice()
    router.visit(urlFor('tracking.sign_in'), { replace: true })
  }

  return (
    <div className="min-h-screen bg-background">
      <Head title="Pesanan Anda" />
      <FlowHeader
        title="Pesanan Anda"
        className="bg-card"
        actions={
          <Button
            variant="ghost"
            size="desktop"
            onPress={signOut}
            className="-mr-3 gap-1.5 px-3 text-foreground-secondary"
          >
            <IconLogout className="size-4.5" />
            Keluar
          </Button>
        }
      >
        <p className="pb-3.5 text-note leading-[1.3] text-muted-foreground">
          Terverifikasi: {maskPhone(phone)}
        </p>
      </FlowHeader>
      <main className="mx-auto box-content flex max-w-page flex-col gap-2.5 px-5 pt-4.5">
        {orders.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-5">
            <EmptyState
              icon={IconInbox}
              title="Belum ada pesanan"
              description="Pesanan dengan nomor ini akan muncul di sini setelah Anda memesan penjemputan."
            />
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <Overline as="h2" className="px-1">
                  Aktif
                </Overline>
                {active.map((order) => (
                  <OrderCard key={order.number} order={order} />
                ))}
              </>
            )}
            {history.length > 0 && (
              <>
                <Overline as="h2" className="px-1 pt-3.5">
                  Riwayat
                </Overline>
                <OrderHistory orders={history} />
              </>
            )}
          </>
        )}
        <div className="mt-1.5 mb-5 flex justify-end">
          <OrderPickupButton
            label={orders.length ? 'Pesan Penjemputan Lagi' : 'Pesan Penjemputan'}
            withIcon={false}
            className="flex-1 sm:w-auto sm:min-w-74 sm:flex-none sm:px-7"
          />
        </div>
      </main>
    </div>
  )
}

TrackingOrders.layout = [FlowLayout]
