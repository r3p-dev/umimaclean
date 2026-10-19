import { useRef } from 'react'
import {
  IconArrowLeft,
  IconCurrentLocation,
  IconDotsVertical,
  IconExternalLink,
  IconMapPinOff,
  IconPlayerSkipForward,
} from '@tabler/icons-react'
import { Button, LinkButton } from '~/components/ui/button'
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import RouteMap, { type RouteMapHandle } from '~/components/organisms/route_map'
import { MapLegend } from '~/components/organisms/tasks/queue_map'
import type { PickupPoint } from '~/lib/order/draft'

const FLOATING = 'bg-card text-foreground shadow-1 hover:bg-card hover:text-foreground'

export default function TaskMapPanel({
  me,
  destination,
  route,
  routeFailed,
  backHref,
  chip,
  externalHref,
  externalLabel,
  skipLabel,
  onSkip,
}: {
  me: PickupPoint
  destination: PickupPoint
  route: PickupPoint[] | null
  routeFailed: boolean
  backHref: string
  chip: string
  externalHref: string
  externalLabel: string
  skipLabel: string
  onSkip: () => void
}) {
  const map = useRef<RouteMapHandle>(null)

  return (
    <RouteMap
      ref={map}
      me={me}
      destination={destination}
      route={route}
      label="Peta rute ke lokasi tugas"
      inset={{ top: 56, right: 0, bottom: 40, left: 0 }}
      className="absolute inset-0"
    >
      <div className="absolute inset-x-3 top-3 z-20 flex items-center gap-2">
        <LinkButton
          variant="ghost"
          size="icon"
          data-surface="light"
          className={`rounded-full ${FLOATING}`}
          href={backHref}
          aria-label="Kembali ke antrean"
        >
          <IconArrowLeft className="size-5.5" />
        </LinkButton>
        <span
          data-surface="light"
          className="flex h-8 items-center rounded-pill bg-card px-3 text-meta leading-none font-semibold whitespace-nowrap shadow-1"
        >
          {chip}
        </span>
        <span className="flex-1" />
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            size="icon"
            data-surface="light"
            aria-label="Opsi lain"
            className={`rounded-full ${FLOATING}`}
          >
            <IconDotsVertical className="size-5.5" />
          </Button>
          <DropdownMenu aria-label="Opsi lain">
            <DropdownMenuItem
              href={externalHref}
              target="_blank"
              rel="noopener noreferrer"
              textValue={externalLabel}
            >
              <IconExternalLink />
              {externalLabel}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onAction={onSkip} textValue={skipLabel}>
              <IconPlayerSkipForward />
              {skipLabel}
            </DropdownMenuItem>
          </DropdownMenu>
        </DropdownMenuTrigger>
      </div>
      {routeFailed && (
        <div
          data-surface="light"
          role="alert"
          className="absolute inset-x-3 top-17 z-20 flex max-w-105 flex-col gap-2.5 rounded-lg border border-attention-border-soft bg-card px-3.5 py-3 shadow-1"
        >
          <div className="flex items-start gap-2.5 text-sm leading-[1.4] font-medium text-attention-foreground">
            <IconMapPinOff className="mt-0.5 size-5 shrink-0" />
            Rute bawaan sedang tidak tersedia. Posisi Anda dan tujuan tetap tampil di peta.
          </div>
          <LinkButton
            className="text-[15px]"
            href={externalHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconExternalLink className="size-4.5" />
            {externalLabel}
          </LinkButton>
        </div>
      )}
      <MapLegend target="destination" className="bottom-7.5 left-3" />
      <Button
        variant="ghost"
        data-surface="light"
        aria-label="Pusatkan ke lokasi saya"
        onPress={() => map.current?.recenter()}
        className="absolute right-3 bottom-7.5 z-20 h-cta w-13 rounded-full bg-card p-0 text-primary shadow-1 hover:bg-card hover:text-primary"
      >
        <IconCurrentLocation className="size-6.5" />
      </Button>
    </RouteMap>
  )
}
