import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { IconCalendarEvent, IconClipboardCheck, IconReceipt, IconUser } from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import BackLink from '~/components/molecules/back_link'
import InfoNote from '~/components/molecules/info_note'
import LocationMap from '~/components/organisms/location_map'
import OrderSummaryCard from '~/components/organisms/order/order_summary_card'
import PickupAddressCard from '~/components/organisms/order/pickup_address_card'
import AccountLayout from '~/components/templates/account_layout'
import { Button, LinkButton } from '~/components/ui/button'
import { shortStreet, type SavedAddress } from '~/lib/order/addresses'
import { itemsSummary, type ItemCounts } from '~/lib/order/items'
import { formatSchedule } from '~/lib/order/schedule'

export default function OrderConfirm({
  draft,
  pickupAddress,
  deliveryAddress,
  customer,
}: {
  draft: { items: ItemCounts; note: string; date: string; slot: number }
  pickupAddress: SavedAddress
  deliveryAddress: SavedAddress | null
  customer: Data.User
}) {
  const [isBusy, setBusy] = useState(false)
  const editHref = urlFor('customer.order.create')
  const items = itemsSummary(draft.items)
  const schedule = formatSchedule(draft.date, draft.slot, 'day')

  function place() {
    if (isBusy) {
      return
    }
    router.post(
      urlFor('customer.order.store'),
      {},
      {
        onStart: () => setBusy(true),
        onError: (errors) => {
          toast.error(Object.values(errors)[0] ?? 'Pesanan belum bisa dibuat. Periksa lagi.')
        },
        onFinish: () => setBusy(false),
      }
    )
  }

  const cta = (
    <Button size="cta" className="w-full" isPending={isBusy} onPress={place}>
      {isBusy ? 'Membuat pesanan…' : 'Buat Pesanan'}
    </Button>
  )

  return (
    <>
      <Head title="Konfirmasi Pesanan" />
      <div className="mx-auto box-content max-w-page px-5 pt-4 lg:pt-8">
        <BackLink href={editHref} label="Ubah pesanan" />
        <h1 className="mt-2 text-[28px] leading-[1.15] font-bold tracking-[-0.02em] lg:text-[34px]">
          Konfirmasi Pesanan
        </h1>
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <PickupAddressCard
              pickup={pickupAddress}
              delivery={deliveryAddress}
              media={
                <LocationMap
                  center={pickupAddress.point}
                  isInteractive={false}
                  className="h-32.5"
                />
              }
              action={
                <LinkButton variant="link" href={editHref} aria-label="Ubah alamat penjemputan">
                  Ubah
                </LinkButton>
              }
            />
            <div className="flex flex-col gap-4">
              <Card role="region" aria-labelledby="items-schedule-title">
                <CardHeader>
                  <CardTitle as="h2" id="items-schedule-title">
                    Barang & jadwal
                  </CardTitle>
                  <CardAction>
                    <LinkButton variant="link" href={editHref} aria-label="Ubah barang dan jadwal">
                      Ubah
                    </LinkButton>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1">
                    <p className="text-base font-semibold">{items}</p>
                    {draft.note && (
                      <p className="text-foreground-secondary">Catatan: {draft.note}</p>
                    )}
                  </div>
                  <p className="flex items-center gap-2.5 border-t border-border pt-3 text-md">
                    <IconCalendarEvent className="size-5 shrink-0 text-foreground-secondary" />
                    {schedule}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <IconUser className="size-5 shrink-0 text-foreground-secondary" />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-md font-semibold">{customer.name}</span>
                      <span className="text-foreground-secondary">{customer.phone}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col gap-3 sm:col-span-2 lg:hidden">
              <InfoNote icon={IconClipboardCheck}>
                Layanan dan harga ditentukan tim kami setelah barang diperiksa.
              </InfoNote>
              <InfoNote icon={IconReceipt}>
                Tagihan muncul di Riwayat dan dikirim via WhatsApp.
              </InfoNote>
              {cta}
            </div>
          </div>
          <div className="sticky top-22 max-lg:hidden">
            <OrderSummaryCard
              where={`${pickupAddress.label} · ${shortStreet(pickupAddress.addressText)}`}
              items={items}
              schedule={schedule}
            >
              {cta}
            </OrderSummaryCard>
          </div>
        </div>
      </div>
    </>
  )
}

OrderConfirm.layout = [AccountLayout]
