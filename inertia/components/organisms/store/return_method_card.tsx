import { useId, type ComponentType, type SVGProps } from 'react'
import {
  IconArrowDownLeft,
  IconBuildingStore,
  IconMapPinFilled,
  IconTruckDelivery,
} from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { FieldDescription } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import ChoiceRow from '~/components/molecules/choice_row'
import LocationMap from '~/components/organisms/location_map'
import type { PickupPoint } from '~/lib/location/point'
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
}) {
  const addressId = useId()

  return (
    <section className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-4">
      <h2 className="text-base leading-[1.3] font-semibold">3 · Setelah selesai dicuci</h2>
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
                <span className="text-[15px] leading-[1.3] font-semibold">{option.label}</span>
                <span className="text-meta leading-[1.4] font-normal text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </ChoiceRow>
          )
        })}
      </div>
      {value === 'antar' && shouldUseSaved && savedArea && (
        <div className="flex flex-col gap-1 rounded-md bg-background px-3.5 py-3">
          <span className="text-caption leading-[1.3] font-medium text-muted-foreground">
            Tujuan antar · alamat tersimpan
          </span>
          <span className="flex items-center gap-1.5 text-[14.5px] leading-[1.4] font-semibold">
            <IconMapPinFilled className="size-4.5 text-destructive" />
            {savedArea}
          </span>
          <span className="text-caption leading-[1.45] text-muted-foreground">
            Konfirmasikan ke pelanggan bahwa alamatnya masih sama. Alamat lengkap hanya terbuka
            untuk kurir saat tugas antar aktif.
          </span>
          <Button
            variant="link"
            onPress={onChoosePoint}
            className="self-start py-1.5 text-[13.5px] leading-none"
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
              className="px-3 leading-[1.3]"
            />
            <FieldDescription className="text-caption leading-[1.4]">
              Geser peta untuk menyesuaikan titik antar.
            </FieldDescription>
          </div>
        </div>
      )}
      {value === 'antar' && (
        <p className="flex gap-1.5 text-caption leading-[1.45] text-muted-foreground">
          <IconArrowDownLeft className="mt-0.5 size-3.75 shrink-0" />
          Masuk antrean Antar otomatis setelah statusnya Siap Diantar.
        </p>
      )}
    </section>
  )
}
