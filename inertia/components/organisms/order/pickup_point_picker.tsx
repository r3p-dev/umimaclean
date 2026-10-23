import { type Ref } from 'react'
import { IconCurrentLocation, IconHandStop, IconMapPinFilled } from '@tabler/icons-react'
import AreaBadge from '~/components/molecules/area_badge'
import LocationMap, { type LocationMapHandle } from '~/components/organisms/location_map'
import { Button } from '~/components/ui/button'
import { Field, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { BOUNDARY_CREDIT, type AreaTone } from '~/lib/location/service_area'
import type { PickupPoint, PointLabel } from '~/lib/location/point'
import { cn } from '~/lib/shared/utils'

export default function PickupPointPicker({
  title = 'Titik penjemputan',
  mapRef,
  start,
  label,
  tone,
  isLoading,
  isLocating,
  landmark,
  onLocate,
  onMoveEnd,
  onLandmarkChange,
  className,
}: {
  title?: string
  mapRef: Ref<LocationMapHandle>
  start: PickupPoint
  label: PointLabel | null
  tone: AreaTone | null
  isLoading: boolean
  isLocating: boolean
  landmark: string
  onLocate: () => void
  onMoveEnd: (point: PickupPoint) => void
  onLandmarkChange: (landmark: string) => void
  className?: string
}) {
  return (
    <section
      aria-labelledby="pickup-point-title"
      className={cn('flex min-w-0 flex-col gap-3', className)}
    >
      <div className="flex flex-col gap-1">
        <h2 id="pickup-point-title" className="text-[17px] leading-[1.3] font-semibold">
          {title}
        </h2>
        <p className="text-meta leading-[1.45] text-muted-foreground">
          Penanda mengikuti alamat yang Anda isi. Geser peta bila belum tepat di rumah Anda.
        </p>
      </div>
      <LocationMap
        ref={mapRef}
        center={start}
        onMoveEnd={onMoveEnd}
        label="Peta titik penjemputan. Geser peta atau pakai tombol panah agar penanda tepat di rumah Anda."
        className="h-72 rounded-lg border border-border lg:h-90"
      >
        <span
          data-surface="inverse"
          className="pointer-events-none absolute top-3 left-1/2 z-10 flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-pill bg-surface-inverse px-3 text-caption leading-none font-medium whitespace-nowrap text-surface-inverse-foreground"
        >
          <IconHandStop className="size-4" />
          Geser peta untuk menyesuaikan titik
        </span>
        <Button
          type="button"
          variant="outline"
          aria-label="Gunakan lokasi saya"
          aria-busy={isLocating}
          onPress={onLocate}
          className="absolute right-3 bottom-6 z-10 size-12.5 border-border p-0 text-primary shadow-1"
        >
          <IconCurrentLocation className={cn('size-6', isLocating && 'animate-pulse')} />
        </Button>
      </LocationMap>
      <p className="-mt-1.5 text-caption leading-[1.4] text-muted-foreground">{BOUNDARY_CREDIT}</p>
      <div className="flex items-start gap-3" aria-live="polite">
        <IconMapPinFilled className="size-6 shrink-0 text-primary" />
        <div className="flex flex-1 flex-col gap-1.5">
          <p className="text-base leading-[1.3] font-semibold">
            {label?.street ?? (isLoading ? 'Membaca alamat…' : 'Alamat belum terbaca')}
          </p>
          <p className="text-sm leading-[1.4] text-foreground-secondary">
            {label?.area ?? 'Pastikan penanda tepat di rumah Anda.'}
          </p>
          <AreaBadge tone={tone} isLoading={isLoading} />
        </div>
      </div>
      {tone === 'outside' && (
        <p role="alert" className="text-note leading-[1.4] font-medium text-destructive-text">
          Titik ini di luar area antar-jemput gratis. Geser peta ke alamat di area layanan.
        </p>
      )}
      <Field className="pt-2">
        <FieldLabel htmlFor="order-landmark" className="gap-1">
          Patokan <span className="font-normal text-muted-foreground">(opsional)</span>
        </FieldLabel>
        <Input
          id="order-landmark"
          placeholder="mis. pagar hitam, sebelah warung"
          value={landmark}
          onChange={(event) => onLandmarkChange(event.target.value.slice(0, 120))}
        />
      </Field>
    </section>
  )
}
