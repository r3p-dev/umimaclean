import { useEffect, useState, type ComponentProps } from 'react'
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconCurrentLocation,
  IconHelpCircleFilled,
  IconInfoCircle,
  IconLoader2,
} from '@tabler/icons-react'
import { cn } from 'cn'
import type { Data } from '@generated/data'
import type { Registry } from '@generated/registry/schema'
import { urlFor } from '~/client'
import Note from '~/components/atoms/note'
import ServiceAreaMap from '~/components/organisms/service_area_map'
import { Button } from '~/components/ui/button'
import { FieldError } from '~/components/ui/field'
import type { MapPoint } from '~/lib/map/area_map'

type CheckResponse = Registry['area.check_point']['types']['response']
type LabelResponse = Registry['places.show']['types']['response']
// The JSON bodies of a refused check: @adonisjs/limiter's 429 and VineJS's 422 (D80).
type ErrorBody = { errors: { message: string }[] }
type Tone = ComponentProps<typeof Note>['tone'] | 'checking'
type Check = {
  tone: Tone
  text: string
  isCovered: boolean | null
  district: CheckResponse['district']
}

const CHECKING: Check = {
  tone: 'checking',
  text: 'Mengecek area…',
  isCovered: null,
  district: null,
}
const ICONS = {
  checking: IconLoader2,
  info: IconHelpCircleFilled,
  attention: IconHelpCircleFilled,
  success: IconCircleCheckFilled,
  danger: IconCircleXFilled,
}
// Taps and keys come quickly one after another; only the point where they stop is checked.
const SETTLE_PAUSE_MS = 300

async function checkPoint(point: MapPoint, signal: AbortSignal): Promise<Check> {
  const response = await fetch(urlFor('area.check_point', {}, { qs: point }), {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (response.status === 429 || response.status === 422) {
    const body: ErrorBody = await response.json()
    return { tone: 'attention', text: body.errors[0].message, isCovered: null, district: null }
  }
  if (!response.ok) {
    return {
      tone: 'attention',
      text: 'Pengecekan area gagal. Geser peta sedikit untuk mencoba lagi.',
      isCovered: null,
      district: null,
    }
  }
  const { isCovered, district }: CheckResponse = await response.json()
  return isCovered
    ? { tone: 'success', text: 'Masuk area layanan.', isCovered, district }
    : {
        tone: 'danger',
        text: 'Di luar area layanan. Geser peta ke alamat di area antar-jemput gratis.',
        isCovered,
        district,
      }
}

// The street and kelurahan under the pin (MAP-1); empty when the map data is missing or the request
// fails, because the kecamatan from the coverage check still says where the pin is.
async function readLabel(point: MapPoint, signal: AbortSignal): Promise<LabelResponse> {
  const response = await fetch(urlFor('places.show', {}, { qs: point }), {
    headers: { Accept: 'application/json' },
    signal,
  })
  return response.ok ? response.json() : { street: null, kelurahan: null }
}

// The map of the address form (CUST-3, AREA-4, MAP-1): the pin stays in the centre and the map moves
// under it (drag, tap, arrow keys, the device's location or a place search). Every stop is checked by
// the server and the area under the pin is shown; the pin travels with the form as `lat` and `lng`.
export default function PinPicker({
  start,
  target,
  onTargetChange,
  onSettle,
  shapes,
  tilesUrl,
  devWarning,
  error,
}: {
  start: MapPoint
  target: MapPoint | null
  onTargetChange: (point: MapPoint) => void
  onSettle: (point: MapPoint) => void
  shapes: Data.ServiceAreaShape[]
  tilesUrl: string | null
  devWarning: string | null
  error?: string
}) {
  const [point, setPoint] = useState(start)
  const [check, setCheck] = useState<Check>(CHECKING)
  const [label, setLabel] = useState<LabelResponse>({ street: null, kelurahan: null })
  // Signed-in pages render only in the browser, so `navigator` is there (config/inertia.ts).
  const [canLocate, setCanLocate] = useState(() => 'geolocation' in navigator)
  const [isLocating, setIsLocating] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      readLabel(point, controller.signal)
        .then(setLabel)
        .catch((labelError: unknown) => {
          if (controller.signal.aborted) return
          console.error(labelError)
        })
      checkPoint(point, controller.signal)
        .then(setCheck)
        .catch((checkError: unknown) => {
          // The map moved again and aborted this check; its answer no longer matters.
          if (controller.signal.aborted) return
          console.error(checkError)
          setCheck({
            tone: 'attention',
            text: 'Pengecekan area gagal. Periksa koneksi Anda.',
            isCovered: null,
            district: null,
          })
        })
    }, SETTLE_PAUSE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [point])

  // Hidden when the customer has refused location before. A browser that cannot query this
  // permission keeps the button; a refusal then hides it on the first press.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((permission) => setCanLocate(permission.state !== 'denied'))
      .catch(() => {})
  }, [])

  function settle(nextPoint: MapPoint) {
    setCheck(CHECKING)
    setLabel({ street: null, kelurahan: null })
    setPoint(nextPoint)
    onSettle(nextPoint)
  }

  function locate() {
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        onTargetChange({ lat: position.coords.latitude, lng: position.coords.longitude })
      },
      // Refused, unavailable or too slow: the button goes away and the pin is placed by hand.
      () => {
        setIsLocating(false)
        setCanLocate(false)
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  }

  // The street on the first line, then kelurahan, kecamatan and kota.
  const title = label.street ?? label.kelurahan
  const area = [
    label.street ? label.kelurahan : null,
    check.district && `Kec. ${check.district.name}`,
    check.district?.city,
  ]
    .filter(Boolean)
    .join(', ')
  const Icon = ICONS[check.tone]

  return (
    <div className="flex flex-col gap-3">
      <Note
        tone="info"
        icon={<IconInfoCircle aria-hidden="true" className="mt-px size-4.5 shrink-0" />}
      >
        Tetapkan pin yang tepat: kami akan menjemput dan mengantar ke lokasi peta. Periksa apakah
        sudah benar; jika belum, ketuk peta untuk menyesuaikan.
      </Note>
      <ServiceAreaMap
        shapes={shapes}
        tilesUrl={tilesUrl}
        devWarning={devWarning}
        pin={{ start, target, onSettle: settle }}
        className="h-64 sm:h-80"
      >
        {canLocate && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Gunakan lokasi saya"
            isDisabled={isLocating}
            onPress={locate}
            className="absolute right-3 bottom-3 size-11 rounded-full shadow-md"
          >
            <IconCurrentLocation
              aria-hidden="true"
              className={isLocating ? 'size-5 animate-pulse' : 'size-5'}
            />
          </Button>
        )}
      </ServiceAreaMap>
      <input type="hidden" name="lat" value={point.lat} />
      <input type="hidden" name="lng" value={point.lng} />
      <div role="status" aria-live="polite" className="flex flex-col gap-1">
        {title && <p className="text-base font-semibold">{title}</p>}
        {area && <p className="text-sm text-muted-foreground">{area}</p>}
        <Note
          tone={check.tone === 'checking' ? 'info' : check.tone}
          variant="plain"
          icon={
            <Icon
              aria-hidden="true"
              className={cn('mt-px size-4.5 shrink-0', check.tone === 'checking' && 'animate-spin')}
            />
          }
        >
          {check.text}
        </Note>
      </div>
      {error && <FieldError id="lat-error">{error}</FieldError>}
    </div>
  )
}
