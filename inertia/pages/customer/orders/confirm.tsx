import { useState, type ReactNode, type SyntheticEvent } from 'react'
import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconArrowLeft,
  IconCalendarEvent,
  IconClipboardCheck,
  IconMapPin,
  IconPackage,
} from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import Note from '~/components/atoms/note'
import FlowLayout from '~/components/templates/flow_layout'
import { Button, buttonVariants } from '~/components/ui/button'
import { bagSizeLabel, formatPickupDate, formatSlotTime } from '~/lib/order_format'
import { ItemKind } from '~/lib/service_enums'

type ConfirmDraft = {
  items: { itemKind: string; brand?: string; type: string; size: string }[]
  pickupAddressId: number
  deliveryAddressId: number
  pickupDate: string
  pickupSlotId: number
  note?: string
}

function CardHeader({ id, icon, title }: { id: string; icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 id={id} className="flex items-center gap-2 text-base font-semibold">
        {icon}
        <span>{title}</span>
      </h2>
      <Link
        route="customer.orders.create"
        className={buttonVariants({ variant: 'link', className: 'min-h-11 px-2' })}
      >
        Ubah
      </Link>
    </div>
  )
}

// CUST-6: order confirmation (`/pesan/konfirmasi`). Carries `requestKey` against double submits.
export default function OrderConfirm({
  draft,
  pickupAddress,
  deliveryAddress,
  slot,
  requestKey,
}: {
  draft: ConfirmDraft
  pickupAddress: Data.Address
  deliveryAddress: Data.Address
  slot: { id: number; startsAt: string; endsAt: string }
  requestKey: string
}) {
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [isPlacing, setIsPlacing] = useState(false)

  const sameDelivery = pickupAddress.id === deliveryAddress.id
  const firstError = Object.values(errors).find(Boolean)

  function placeOrder(event: SyntheticEvent) {
    event.preventDefault()
    if (isPlacing) return
    router.post(
      urlFor('customer.orders.store'),
      { requestKey },
      {
        preserveScroll: true,
        onStart: () => setIsPlacing(true),
        onError: (serverErrors) => setErrors(serverErrors),
        onFinish: () => setIsPlacing(false),
      }
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-5 pt-4 pb-6 sm:pt-8 sm:pb-12">
      <Head title="Konfirmasi Pesanan" />
      <Link
        route="customer.orders.create"
        className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-foreground/80 hover:text-foreground"
      >
        <IconArrowLeft aria-hidden="true" className="size-4.5" />
        Ubah pesanan
      </Link>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Konfirmasi Pesanan</h1>

      {firstError && <Note tone="danger">{firstError}</Note>}

      <div className="flex flex-col gap-4">
        <section
          aria-labelledby="confirm-items-title"
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
        >
          <CardHeader
            id="confirm-items-title"
            icon={
              <IconPackage aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            }
            title={`Barang (${draft.items.length})`}
          />
          <ul className="flex flex-col gap-2 text-sm">
            {draft.items.map((item, index) => {
              const kindLabel = item.itemKind === ItemKind.BAG ? 'Tas' : 'Sepatu'
              const sizeText =
                item.itemKind === ItemKind.BAG ? bagSizeLabel(item.size) : `EU ${item.size}`
              const name = [item.brand, item.type].filter(Boolean).join(' ')
              return (
                <li key={index} className="border-t border-border pt-2 first:border-t-0 first:pt-0">
                  <span className="font-medium">
                    {kindLabel} · {name}
                  </span>
                  <span className="text-muted-foreground"> — {sizeText}</span>
                </li>
              )
            })}
          </ul>
          {draft.note && (
            <p className="border-t border-border pt-3 text-sm text-muted-foreground">
              Catatan: {draft.note}
            </p>
          )}
        </section>

        <section
          aria-labelledby="confirm-schedule-title"
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
        >
          <CardHeader
            id="confirm-schedule-title"
            icon={
              <IconCalendarEvent
                aria-hidden="true"
                className="size-5 shrink-0 text-muted-foreground"
              />
            }
            title="Jadwal penjemputan"
          />
          <p className="text-sm font-medium">
            {formatPickupDate(draft.pickupDate, 'full')} ·{' '}
            {formatSlotTime(slot.startsAt, slot.endsAt)}
          </p>
        </section>

        <section
          aria-labelledby="confirm-address-title"
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
        >
          <CardHeader
            id="confirm-address-title"
            icon={
              <IconMapPin aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            }
            title="Alamat"
          />
          <div className="flex flex-col gap-1 text-sm">
            <p className="text-base font-semibold">{pickupAddress.label}</p>
            <p>
              {pickupAddress.recipientName} · {pickupAddress.recipientPhone}
            </p>
            <p className="text-muted-foreground">
              {pickupAddress.addressText}
              {pickupAddress.details ? `, ${pickupAddress.details}` : ''}
            </p>
            <p className="text-xs text-muted-foreground">
              Kec. {pickupAddress.kecamatan}, {pickupAddress.city}
            </p>
          </div>
          <p className="border-t border-border pt-3 text-sm text-muted-foreground">
            {sameDelivery
              ? 'Pengantaran: sama dengan alamat penjemputan.'
              : `Pengantaran: ${deliveryAddress.label} (${deliveryAddress.recipientName} · ${deliveryAddress.recipientPhone}) — ${deliveryAddress.addressText}, Kec. ${deliveryAddress.kecamatan}.`}
          </p>
        </section>

        <Note
          tone="info"
          icon={<IconClipboardCheck aria-hidden="true" className="mt-px size-4.5 shrink-0" />}
        >
          Layanan dan harga ditentukan tim kami setelah barang diperiksa.
        </Note>
      </div>

      <form
        onSubmit={placeOrder}
        className="sticky bottom-0 z-20 -mx-5 border-t border-border bg-card px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:mt-2 sm:border-0 sm:bg-transparent sm:p-0"
      >
        <input type="hidden" name="requestKey" value={requestKey} />
        <Button type="submit" isDisabled={isPlacing} className="h-12 w-full text-base">
          {isPlacing ? 'Membuat pesanan…' : 'Buat Pesanan'}
        </Button>
      </form>
    </div>
  )
}

OrderConfirm.layout = (page: ReactNode) => (
  <FlowLayout title="Konfirmasi Pesanan">{page}</FlowLayout>
)
