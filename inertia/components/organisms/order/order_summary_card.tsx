import { type ReactNode } from 'react'
import { IconArchive, IconCalendarEvent, IconMapPin } from '@tabler/icons-react'
import Overline from '~/components/atoms/overline'
import { cn } from '~/lib/shared/utils'

export default function OrderSummaryCard({
  where,
  items,
  schedule,
  children,
  className,
}: {
  where: string
  items: string
  schedule: string
  children: ReactNode
  className?: string
}) {
  const rows = [
    { icon: IconMapPin, text: where, isAccent: true },
    { icon: IconArchive, text: items, accent: false },
    { icon: IconCalendarEvent, text: schedule, accent: false },
  ]

  return (
    <section
      aria-labelledby="order-summary-title"
      className={cn('flex flex-col gap-3 rounded-lg border border-border bg-card p-5', className)}
    >
      <Overline as="h2" id="order-summary-title">
        Ringkasan
      </Overline>
      <ul className="flex flex-col gap-2.5">
        {rows.map(({ icon: Icon, text, isAccent }) => (
          <li key={text} className="flex items-start gap-2.5 text-[15px] leading-[1.35]">
            <Icon
              className={cn(
                'mt-px size-5 shrink-0',
                isAccent ? 'text-primary' : 'text-foreground-secondary'
              )}
            />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <p className="rounded-md bg-attention px-3 py-2.5 text-note leading-normal text-attention-foreground">
        Layanan dan harga ditentukan setelah barang diperiksa. Tagihan dikirim via WhatsApp.
      </p>
      {children}
    </section>
  )
}
