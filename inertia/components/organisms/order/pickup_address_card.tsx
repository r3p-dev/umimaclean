import { type ReactNode } from 'react'
import { IconMapPin } from '@tabler/icons-react'
import Overline from '~/components/atoms/overline'
import type { SavedAddress } from '~/lib/order/addresses'
import { cn } from '~/lib/shared/utils'

function LabelPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-pill bg-accent px-2 py-1.25 text-xs leading-none font-semibold text-accent-foreground">
      {children}
    </span>
  )
}

export default function PickupAddressCard({
  pickup,
  delivery,
  action,
  media,
  className,
}: {
  pickup: SavedAddress
  delivery?: SavedAddress | null
  action: ReactNode
  media?: ReactNode
  className?: string
}) {
  return (
    <section
      aria-labelledby="pickup-address-title"
      className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}
    >
      {media}
      <div className="flex flex-col gap-1.5 px-4 pt-2 pb-4">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <IconMapPin className="size-5 shrink-0 text-primary" />
            <Overline as="h2" id="pickup-address-title">
              Dijemput di
            </Overline>
            <LabelPill>{pickup.label}</LabelPill>
          </span>
          {action}
        </div>
        <p className="text-[15px] leading-[1.45] font-medium">{pickup.addressText}</p>
        {pickup.landmark && (
          <p className="text-sm leading-[1.4] text-foreground-secondary">
            Patokan: {pickup.landmark}
          </p>
        )}
        {delivery && (
          <p className="mt-1.5 flex flex-col gap-1 border-t border-border pt-2.5 text-sm leading-[1.4]">
            <span className="flex items-center gap-2">
              <Overline>Diantar ke</Overline>
              <LabelPill>{delivery.label}</LabelPill>
            </span>
            <span className="text-foreground-secondary">{delivery.addressText}</span>
          </p>
        )}
      </div>
    </section>
  )
}
