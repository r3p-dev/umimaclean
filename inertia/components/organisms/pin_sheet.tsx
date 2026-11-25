import { useState } from 'react'
import { IconArrowLeft } from '@tabler/icons-react'
import type { Data } from '@generated/data'
import CoverageStatus from '~/components/molecules/coverage_status'
import LocateButton from '~/components/molecules/locate_button'
import ServiceAreaMap from '~/components/organisms/service_area_map'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogTitle } from '~/components/ui/dialog'
import type { MapPoint } from '~/lib/map/area_map'
import { usePinCheck } from '~/lib/map/pin_check'

// The phone's "Ubah lokasi" sheet (CUST-3, D109): full screen, no input fields. A read-only card
// shows the form's address text and the area under the pin, then the map with its centre pin, the
// coverage line and "Konfirmasi". Only "Konfirmasi" hands the point back to the form; the back arrow
// keeps the old one.
export default function PinSheet({
  isOpen,
  onOpenChange,
  start,
  addressText,
  shapes,
  tilesUrl,
  devWarning,
  onConfirm,
}: {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  start: MapPoint
  addressText: string
  shapes: Data.ServiceAreaShape[]
  tilesUrl: string | null
  devWarning: string | null
  onConfirm: (point: MapPoint) => void
}) {
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showCloseButton={false}
      className="top-0 left-0 h-dvh max-w-none translate-x-0 translate-y-0 content-stretch gap-3 rounded-none p-4 sm:max-w-none"
    >
      <SheetBody
        start={start}
        addressText={addressText}
        shapes={shapes}
        tilesUrl={tilesUrl}
        devWarning={devWarning}
        onConfirm={onConfirm}
      />
    </Dialog>
  )
}

// Mounted only while the sheet is open, so each opening starts from the form's point.
function SheetBody({
  start,
  addressText,
  shapes,
  tilesUrl,
  devWarning,
  onConfirm,
}: {
  start: MapPoint
  addressText: string
  shapes: Data.ServiceAreaShape[]
  tilesUrl: string | null
  devWarning: string | null
  onConfirm: (point: MapPoint) => void
}) {
  const [point, setPoint] = useState(start)
  const [target, setTarget] = useState<MapPoint | null>(null)
  const check = usePinCheck(point)
  // The kecamatan and kota of the service area under the pin, as the server stores them on save.
  const area = check.district ? `Kec. ${check.district.name}, ${check.district.city}` : null
  // A pin known to be outside cannot be confirmed; a failed check can, the server checks on save.
  const canConfirm = check.tone !== 'checking' && check.isCovered !== false

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="-ml-2 flex items-center gap-1">
        <DialogClose variant="ghost" size="icon" aria-label="Kembali" className="size-11">
          <IconArrowLeft aria-hidden="true" className="size-5" />
        </DialogClose>
        <DialogTitle>Ubah lokasi</DialogTitle>
      </div>
      <section
        aria-labelledby="chosen-address-title"
        className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3"
      >
        <h3 id="chosen-address-title" className="text-sm text-muted-foreground">
          Alamat yang dipilih
        </h3>
        {addressText && <p className="text-base font-semibold">{addressText}</p>}
        {area && <p className="text-sm text-muted-foreground">{area}</p>}
      </section>
      <div className="relative min-h-0 flex-1">
        <ServiceAreaMap
          shapes={shapes}
          tilesUrl={tilesUrl}
          devWarning={devWarning}
          pin={{ start, target, onSettle: setPoint }}
          className="absolute inset-0"
        >
          <LocateButton onLocate={setTarget} />
        </ServiceAreaMap>
      </div>
      <CoverageStatus check={check} />
      <Button
        type="button"
        isDisabled={!canConfirm}
        onPress={() => onConfirm(point)}
        className="h-12 w-full text-base"
      >
        Konfirmasi
      </Button>
    </div>
  )
}
