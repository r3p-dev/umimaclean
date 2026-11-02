import { Head } from '@inertiajs/react'
import { urlFor } from '~/client'
import { LinkButton } from '~/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import ActiveOrderPanel from '~/components/organisms/home/active_order_panel'
import QuickOrderPanel from '~/components/organisms/home/quick_order_panel'
import RecentOrdersCard from '~/components/organisms/home/recent_orders_card'
import AccountLayout from '~/components/templates/account_layout'
import type { Data } from '@generated/data'
import type { SavedAddress } from '~/lib/order/addresses'
import { greetingFor } from '~/lib/shared/date'
import type { OrderRecord } from '~/lib/tracking/orders'

export default function CustomerHome({
  user,
  primaryAddress,
  addressLabels,
  activeOrder,
  recentOrders,
}: {
  user: Data.User
  primaryAddress: SavedAddress | null
  addressLabels: string[]
  activeOrder: OrderRecord | null
  recentOrders: OrderRecord[]
}) {
  return (
    <>
      <Head title="Beranda" />
      <div className="mx-auto box-content max-w-page px-5 pt-6 lg:pt-10">
        <h1 className="text-[28px] leading-[1.15] font-bold tracking-[-0.02em] lg:text-[34px]">
          <span className="mb-1.5 block text-base leading-[1.3] font-medium tracking-normal text-foreground-secondary lg:hidden">
            {greetingFor()},
          </span>
          <span className="lg:hidden">{user.name}</span>
          <span className="max-lg:hidden">
            {greetingFor()}, {user.firstName}
          </span>
        </h1>
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
          <div className="flex flex-col gap-4 lg:gap-6">
            {activeOrder && <ActiveOrderPanel order={activeOrder} />}
            <div className="lg:hidden">
              <QuickOrderPanel pickup={primaryAddress} />
            </div>
            {recentOrders.length > 0 && <RecentOrdersCard orders={recentOrders} />}
          </div>
          <aside className="hidden flex-col gap-4 lg:flex">
            <QuickOrderPanel pickup={primaryAddress} />
            <Card role="region" aria-labelledby="saved-addresses-title">
              <CardHeader>
                <CardTitle as="h2" id="saved-addresses-title">
                  Alamat tersimpan
                </CardTitle>
                <CardAction>
                  <LinkButton variant="link" href={urlFor('customer.addresses.index')}>
                    Atur
                  </LinkButton>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p>
                  {addressLabels.length ? addressLabels.join(' · ') : 'Belum ada alamat tersimpan.'}
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  )
}

CustomerHome.layout = [AccountLayout]
