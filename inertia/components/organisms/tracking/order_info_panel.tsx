import { IconArrowDownLeft, IconArrowUpRight, IconClipboardCheck } from '@tabler/icons-react'
import { TONE_CLASSES } from '~/components/atoms/status_tone'
import BillLineItem from '~/components/molecules/bill_line_item'
import DetailRows from '~/components/molecules/detail_rows'
import { customerLinks } from '~/lib/navigation/customer_links'
import { billRows } from '~/lib/payment/bill'
import type { OrderRecord } from '~/lib/tracking/orders'
import type { TrackingView } from '~/lib/tracking/status'
import { cn } from '~/lib/shared/utils'

function shortAddress(address: string) {
  return address
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && !/^rt\b|^rw\b|\brt\s*\d/i.test(part))
    .join(', ')
}

export default function OrderInfoPanel({
  order,
  view,
  className,
  id,
}: {
  order: OrderRecord
  view: TrackingView
  className?: string
  id?: string
}) {
  const paymentTone = TONE_CLASSES[view.payment.tone]

  return (
    <div id={id} role="tabpanel" className={cn('flex w-full min-w-0 flex-col gap-3', className)}>
      <section className="flex flex-col gap-1 rounded-lg border border-border bg-card px-4 pt-0.5">
        <h2 className="mt-3.5 mb-1 text-base leading-[1.3] font-semibold">Barang &amp; layanan</h2>
        {view.servicesKnown && order.bill && (
          <>
            <p className="my-0.5 flex gap-2 rounded-md bg-status-periksa-bg px-3 py-2.5 text-note leading-[1.45] text-status-periksa-fg">
              <IconClipboardCheck className="my-[1.6px] size-4.25 shrink-0" />
              <span>
                Layanan di bawah ditentukan tim kami setelah memeriksa kondisi barang ·{' '}
                {order.bill.decidedAt}
              </span>
            </p>
            <ul className="flex flex-col gap-1">
              {billRows(order.bill).map((row) => (
                <BillLineItem key={row.name} row={row} />
              ))}
            </ul>
            <p className="flex justify-between py-3.5 text-base leading-none font-bold">
              <span>Total</span>
              <span>{view.total}</span>
            </p>
          </>
        )}
        {view.servicesPending && (
          <>
            <p className="flex justify-between gap-3 border-b border-border py-3.5">
              <span className="text-[15px] leading-[1.3] font-medium">{view.itemsSummary}</span>
              <span className="text-note leading-[1.3] text-muted-foreground">perkiraan</span>
            </p>
            <p className="flex items-center justify-between gap-3 py-3.5">
              <span className="text-[15px] leading-[1.3] font-medium">Layanan &amp; harga</span>
              <span className="inline-flex h-badge items-center rounded-pill bg-status-periksa-bg px-2.25 text-caption leading-none font-semibold text-status-periksa-fg">
                Ditentukan setelah diperiksa
              </span>
            </p>
          </>
        )}
        {view.cancelled && (
          <p className="pt-1.5 pb-3.5 text-[15px] leading-normal text-muted-foreground">
            {view.itemsSummary} · tidak ada tagihan.
          </p>
        )}
      </section>
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5">
          <h2 className="text-base leading-[1.3] font-semibold">Pembayaran</h2>
          <span
            className={cn(
              'inline-flex h-badge items-center rounded-pill px-2.25 text-caption leading-none font-semibold whitespace-nowrap',
              paymentTone.surface,
              paymentTone.ink
            )}
          >
            {view.payment.label}
          </span>
        </div>
        <DetailRows rows={view.payment.rows} className="px-4" />
      </section>
      <section className="grid grid-cols-2 rounded-lg border border-border bg-card">
        {[
          { label: 'Dijemput', Icon: IconArrowUpRight, ...view.pickup },
          { label: 'Diantar', Icon: IconArrowDownLeft, ...view.delivery },
        ].map(({ label, Icon, title, detail }, index) => (
          <div
            key={label}
            className={cn(
              'flex flex-col gap-1 px-4 py-3.5',
              index === 0 && 'border-r border-border'
            )}
          >
            <span className="flex items-center gap-1.5 text-meta leading-[1.3] font-medium text-muted-foreground">
              <Icon className="size-4.25" />
              {label}
            </span>
            <span className="text-[14.5px] leading-[1.4] font-semibold">{title}</span>
            <span className="text-note leading-[1.4] text-foreground-secondary">{detail}</span>
          </div>
        ))}
      </section>
      <p className="px-1 pt-1 pb-3 text-meta leading-normal text-muted-foreground">
        {shortAddress(order.address)} ·{' '}
        <a
          href={customerLinks.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-icon-btn items-center font-semibold text-primary hover:text-primary-hover hover:underline"
        >
          Bantuan via WhatsApp
        </a>
      </p>
    </div>
  )
}
