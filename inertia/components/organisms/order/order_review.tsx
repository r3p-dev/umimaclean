import {
  IconCalendarEvent,
  IconCalendarX,
  IconClipboardCheck,
  IconReceipt,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import SummaryCard from '~/components/molecules/summary_card'
import LocationMap from '~/components/organisms/location_map'
import type { OrderDraft, PickupPoint } from '~/lib/order/draft'
import { itemsSummary } from '~/lib/order/items'
import { formatSchedule } from '~/lib/order/schedule'
import { displayPhone } from '~/lib/shared/phone'
import { cn } from '~/lib/shared/utils'

const NOTES = [
  {
    Icon: IconClipboardCheck,
    text: 'Layanan dan harga ditentukan tim kami setelah barang diperiksa.',
  },
  {
    Icon: IconReceipt,
    text: 'Tagihan dikirim via WhatsApp. Pencucian dimulai setelah dibayar.',
  },
  { Icon: IconCalendarX, text: 'Pesanan bisa dibatalkan sebelum kurir berangkat.' },
]

export default function OrderReview({
  draft,
  point,
  date,
  slot,
  className,
}: {
  draft: OrderDraft
  point: PickupPoint
  date: string
  slot: number
  className?: string
}) {
  return (
    <div className={cn('grid items-start gap-3 sm:grid-cols-2', className)}>
      <div className="flex flex-col gap-3">
        <SummaryCard
          title="Data diri"
          editHref={urlFor('order.details')}
          editLabel="Ubah data diri"
        >
          <p className="text-base leading-[1.3] font-semibold">{draft.name}</p>
          <p className="text-[14.5px] leading-[1.4] text-foreground-secondary">
            {displayPhone(draft.phone)}
          </p>
        </SummaryCard>
        <SummaryCard
          title="Alamat penjemputan"
          editHref={urlFor('order.details')}
          editLabel="Ubah alamat penjemputan"
          className="gap-1.5 px-4 pt-3.5 pb-4"
          media={<LocationMap center={point} interactive={false} className="h-32.5" />}
        >
          <p className="text-[15px] leading-[1.45] font-medium">{draft.address}</p>
          {draft.landmark && (
            <p className="text-sm leading-[1.4] text-foreground-secondary">
              Patokan: {draft.landmark}
            </p>
          )}
        </SummaryCard>
      </div>
      <div className="flex flex-col gap-3">
        <SummaryCard
          title="Barang & jadwal"
          editHref={urlFor('order.items')}
          editLabel="Ubah barang dan jadwal"
        >
          <p className="text-base leading-[1.3] font-semibold">{itemsSummary(draft.items)}</p>
          {draft.note && (
            <p className="text-sm leading-[1.45] text-foreground-secondary">“{draft.note}”</p>
          )}
          <p className="flex items-center gap-2 border-t border-border pt-2.5 text-[15px] leading-[1.3] font-medium">
            <IconCalendarEvent className="size-5 text-foreground-secondary" />
            {formatSchedule(date, slot, 'long')}
          </p>
        </SummaryCard>
        <section className="flex flex-col gap-2.5 rounded-lg bg-attention p-4 text-attention-foreground">
          <h2 className="text-[15px] leading-[1.3] font-semibold">Yang perlu Anda ketahui</h2>
          <ul className="flex flex-col gap-2.5">
            {NOTES.map(({ Icon, text }) => (
              <li key={text} className="flex gap-2 text-sm leading-[1.45]">
                <Icon className="my-[1.8px] size-4.5 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
