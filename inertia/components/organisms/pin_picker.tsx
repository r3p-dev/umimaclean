import { useState, useSyncExternalStore } from 'react'
import { IconInfoCircle } from '@tabler/icons-react'
import type { Data } from '@generated/data'
import Note from '~/components/atoms/note'
import CoverageStatus from '~/components/molecules/coverage_status'
import LocateButton from '~/components/molecules/locate_button'
import PinSheet from '~/components/organisms/pin_sheet'
import ServiceAreaMap from '~/components/organisms/service_area_map'
import { Button } from '~/components/ui/button'
import { FieldError } from '~/components/ui/field'
import type { MapPoint } from '~/lib/map/area_map'
import { usePinCheck } from '~/lib/map/pin_check'

// Tailwind's `md` breakpoint: from here the form has room for a map that moves inside the page.
const DESKTOP_QUERY = '(min-width: 48rem)'

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

// The map of the address form (CUST-3, AREA-4, D109). The pin stays in the centre and the map moves
// under it; the server checks every stop, and only the coverage line shows under the map (the street
// and area are read again on save). On desktop the map moves inside the form (drag, tap, arrow keys,
// the device's location, or `target` from the address search). On a phone the form shows a static
// preview, so scrolling never moves it; "Atur pin" opens the full-screen "Ubah lokasi" `PinSheet`.
// `point` travels with the form as `lat` and `lng`.
export default function PinPicker({
  point,
  addressText,
  target,
  onTargetChange,
  onPointChange,
  shapes,
  tilesUrl,
  devWarning,
  error,
}: {
  point: MapPoint
  // Shown in the phone's sheet above the map.
  addressText: string
  target: MapPoint | null
  onTargetChange: (point: MapPoint) => void
  onPointChange: (point: MapPoint) => void
  shapes: Data.ServiceAreaShape[]
  tilesUrl: string | null
  devWarning: string | null
  error?: string
}) {
  const isDesktop = useSyncExternalStore(
    subscribeToWidth,
    () => window.matchMedia(DESKTOP_QUERY).matches
  )
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const check = usePinCheck(point)

  return (
    <div className="flex flex-col gap-3">
      <Note
        tone="info"
        icon={<IconInfoCircle aria-hidden="true" className="mt-px size-4.5 shrink-0" />}
      >
        Tetapkan pin yang tepat: kami akan menjemput dan mengantar ke lokasi peta. Periksa apakah
        sudah benar; jika belum, ketuk peta untuk menyesuaikan.
      </Note>
      {isDesktop ? (
        <ServiceAreaMap
          shapes={shapes}
          tilesUrl={tilesUrl}
          devWarning={devWarning}
          pin={{ start: point, target, onSettle: onPointChange }}
          className="h-80"
        >
          <LocateButton onLocate={onTargetChange} />
        </ServiceAreaMap>
      ) : (
        <>
          <ServiceAreaMap
            shapes={shapes}
            tilesUrl={tilesUrl}
            devWarning={devWarning}
            pin={{ start: point, target: point, isStatic: true }}
            className="h-48"
          >
            {/* A tap anywhere on the preview opens the sheet; "Atur pin" is the button for the
                keyboard and screen readers. */}
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => setIsSheetOpen(true)}
              className="absolute inset-0 cursor-pointer"
            />
            <Button
              type="button"
              variant="outline"
              onPress={() => setIsSheetOpen(true)}
              className="absolute right-3 bottom-3 z-10 h-11 rounded-full px-4 shadow-md"
            >
              Atur pin
            </Button>
          </ServiceAreaMap>
          <PinSheet
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            start={point}
            addressText={addressText}
            shapes={shapes}
            tilesUrl={tilesUrl}
            devWarning={devWarning}
            onConfirm={(confirmedPoint) => {
              onPointChange(confirmedPoint)
              setIsSheetOpen(false)
            }}
          />
        </>
      )}
      <input type="hidden" name="lat" value={point.lat} />
      <input type="hidden" name="lng" value={point.lng} />
      <CoverageStatus check={check} />
      {error && <FieldError id="lat-error">{error}</FieldError>}
    </div>
  )
}
