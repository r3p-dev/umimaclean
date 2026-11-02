import { useId, type ComponentType, type SVGProps } from 'react'
import {
  IconArrowDownLeft,
  IconBuildingStore,
  IconMapPinFilled,
  IconTruckDelivery,
} from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { FieldDescription } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import AreaBadge from '~/components/molecules/area_badge'
import ChoiceRow from '~/components/molecules/choice_row'
import LocationMap from '~/components/organisms/location_map'
import type { PickupPoint } from '~/lib/location/point'
import { BOUNDARY_CREDIT, type AreaTone } from '~/lib/location/service_area'
import type { ReturnMethod } from '~/lib/store/walk_in'
import { RETURN_OPTIONS } from '~/lib/store/walk_in'

const ICONS: Record<ReturnMethod, ComponentType<SVGProps<SVGSVGElement>>> = {
  toko: IconBuildingStore,
  antar: IconTruckDelivery,
}

export default function ReturnMethodCard({
  value,
  onChange,
  savedArea,
  shouldUseSaved,
  onChoosePoint,
  point,
  address,
  onPoint,
  onAddress,
  tone,
  isAreaLoading,
}: {
  value: ReturnMethod
  onChange: (value: ReturnMethod) => void
  savedArea: string | null
  shouldUseSaved: boolean
  onChoosePoint: () => void
  point: PickupPoint
  address: string
  onPoint: (point: PickupPoint) => void
  onAddress: (value: string) => void
  tone: AreaTone | null
  isAreaLoading: boolean
}) {
  const addressId = useId()

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">3 · Setelah selesai dicuci</CardTitle>
      </CardHeader>
      <CardContent>
        <div role="radiogroup" aria-label="Cara pengembalian" className="flex flex-col gap-2">
          {RETURN_OPTIONS.map((option) => {
            const Icon = ICONS[option.key]
            return (
              <ChoiceRow
                key={option.key}
                role="radio"
                tone="subtle"
                markPosition="end"
                isChecked={value === option.key}
                onChange={() => onChange(option.key)}
                className="min-h-16 gap-3 py-2.5"
              >
                <Icon className="size-5.5 shrink-0" />
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-md font-semibold">{option.label}</span>
                  <span className="text-meta font-normal text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </ChoiceRow>
            )
          })}
        </div>
        {value === 'antar' && shouldUseSaved && savedArea && (
          <div className="flex flex-col gap-1 rounded-md bg-background px-3.5 py-3">
            <span className="text-caption font-medium text-muted-foreground">
              Tujuan antar · alamat tersimpan
            </span>
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <IconMapPinFilled className="size-4.5 text-destructive" />
              {savedArea}
            </span>
            <span className="text-caption text-muted-foreground">
              Konfirmasikan ke pelanggan bahwa alamatnya masih sama. Alamat lengkap hanya terbuka
              untuk kurir saat tugas antar aktif.
            </span>
            <Button
              variant="link"
              onPress={onChoosePoint}
              className="self-start py-1.5 text-note leading-none"
            >
              Pilih titik lain di peta
            </Button>
          </div>
        )}
        {value === 'antar' && !(shouldUseSaved && savedArea) && (
          <div className="overflow-hidden rounded-md border border-border">
            <LocationMap
              center={point}
              onMoveEnd={onPoint}
              label="Peta titik antar. Geser peta untuk memindahkan pin."
              className="h-35"
            />
            <div className="flex flex-col gap-1.5 px-3 py-2.5">
              <Label htmlFor={addressId} className="text-note">
                Alamat antar
              </Label>
              <Input
                id={addressId}
                value={address}
                placeholder="Mencari alamat titik ini…"
                onChange={(event) => onAddress(event.target.value)}
                className="px-3"
              />
              <FieldDescription className="text-caption">
                Geser peta untuk menyesuaikan titik antar.
              </FieldDescription>
              <AreaBadge tone={tone} isLoading={isAreaLoading} />
              <p className="text-caption text-muted-foreground">{BOUNDARY_CREDIT}</p>
            </div>
          </div>
        )}
        {value === 'antar' && (
          <p className="flex gap-1.5 text-caption text-muted-foreground">
            <IconArrowDownLeft className="mt-0.5 size-3.75 shrink-0" />
            Masuk antrean Antar otomatis setelah statusnya Siap Diantar.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
