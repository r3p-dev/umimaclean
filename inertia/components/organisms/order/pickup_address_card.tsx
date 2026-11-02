import { type ReactNode } from 'react'
import { IconMapPin } from '@tabler/icons-react'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { SavedAddress } from '~/lib/order/addresses'

function LabelPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-pill bg-accent px-2 py-1 text-xs leading-none font-semibold text-accent-foreground">
      {children}
    </span>
  )
}

export default function PickupAddressCard({
  pickup,
  delivery,
  action,
  media,
}: {
  pickup: SavedAddress
  delivery?: SavedAddress | null
  action: ReactNode
  media?: ReactNode
}) {
  return (
    <Card role="region" aria-labelledby="pickup-address-title">
      {media && <CardContent>{media}</CardContent>}
      <CardHeader>
        <CardTitle as="h2" id="pickup-address-title">
          <span className="flex min-w-0 items-center gap-2">
            <IconMapPin className="size-5 shrink-0 text-primary" />
            Dijemput di
            <LabelPill>{pickup.label}</LabelPill>
          </span>
        </CardTitle>
        <CardAction>{action}</CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <p className="text-md font-medium">{pickup.addressText}</p>
          {pickup.landmark && (
            <p className="text-foreground-secondary">Patokan: {pickup.landmark}</p>
          )}
        </div>
        {delivery && (
          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <CardTitle as="h3">
              <span className="flex items-center gap-2">
                Diantar ke
                <LabelPill>{delivery.label}</LabelPill>
              </span>
            </CardTitle>
            <p className="text-foreground-secondary">{delivery.addressText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
