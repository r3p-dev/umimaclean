import { useEffect, useState, type ComponentProps } from 'react'
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconCurrentLocation,
  IconHelpCircleFilled,
  IconLoader2,
} from '@tabler/icons-react'
import type { Data } from '@generated/data'
import type { Registry } from '@generated/registry/schema'
import { urlFor } from '~/client'
import Note from '~/components/atoms/note'
import PlaceSearch from '~/components/molecules/place_search'
import ServiceAreaMap from '~/components/organisms/service_area_map'
import { Button } from '~/components/ui/button'
import { FieldError } from '~/components/ui/field'
import type { MapPoint } from '~/lib/map/area_map'

type CheckResponse = Registry['area.check_point']['types']['response']
type PointLabel = Registry['places.show']['types']['response']
// The JSON bodies of a refused check: @adonisjs/limiter's 429 and VineJS's 422 (D80).
type ErrorBody = { errors: { message: string }[] }
type Status = { tone: ComponentProps<typeof Note>['tone'] | 'checking'; text: string }

const CHECKING: Status = { tone: 'checking', text: 'Mengecek area…' }
const ICONS = {
  checking: IconLoader2,
  info: IconHelpCircleFilled,
  attention: IconHelpCircleFilled,
  success: IconCircleCheckFilled,
  danger: IconCircleXFilled,
}
// Arrow presses come quickly one after another; only the point where they stop is checked.
const SETTLE_PAUSE_MS = 300

async function checkPoint(point: MapPoint, signal: AbortSignal): Promise<Status> {
  const response = await fetch(urlFor('area.check_point', {}, { qs: point }), {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (response.status === 429 || response.status === 422) {
    const body: ErrorBody = await response.json()
    return { tone: 'attention', text: body.errors[0].message }
  }
  if (!response.ok) {
    return {
      tone: 'attention',
      text: 'Pengecekan area gagal. Geser peta sedikit untuk mencoba lagi.',
    }
  }
  const { isCovered, district }: CheckResponse = await response.json()
  if (isCovered && district) {
    return { tone: 'success', text: `Masuk area layanan: Kec. ${district.name}, ${district.city}.` }
  }
  return {
    tone: 'danger',
    text: 'Di luar area layanan. Geser peta ke alamat di area antar-jemput gratis.',
  }
}

// The street and kelurahan under the pin (MAP-1); nothing when the map data is missing or the
// request fails, because the coverage line already says where the pin is.
async function readLabel(point: MapPoint, signal: AbortSignal) {
  const response = await fetch(urlFor('places.show', {}, { qs: point }), {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!response.ok) {
    return null
  }
  const { street, kelurahan }: PointLabel = await response.json()
  return [street, kelurahan].filter(Boolean).join(', ') || null
}

// AREA-4: a pin in the centre of the map, checked by the server each time the map stops, and sent
// with the form as `lat` and `lng`. "Gunakan lokasi saya" only moves the map (D109).
export default function PinPicker({
  start,
  shapes,
  tilesUrl,
  devWarning,
  error,
}: {
  start: MapPoint
  shapes: Data.ServiceAreaShape[]
  tilesUrl: string | null
  devWarning: string | null
  error?: string
}) {
  const [point, setPoint] = useState(start)
  const [target, setTarget] = useState<MapPoint | null>(null)
  const [status, setStatus] = useState<Status>(CHECKING)
  const [label, setLabel] = useState<string | null>(null)
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
        .then(setStatus)
        .catch((checkError: unknown) => {
          // The map moved again and aborted this check; its answer no longer matters.
          if (controller.signal.aborted) return
          console.error(checkError)
          setStatus({ tone: 'attention', text: 'Pengecekan area gagal. Periksa koneksi Anda.' })
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
    setStatus(CHECKING)
    setLabel(null)
    setPoint(nextPoint)
  }

  function locate() {
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        setTarget({ lat: position.coords.latitude, lng: position.coords.longitude })
      },
      // Refused, unavailable or too slow: the button goes away and the pin is placed by hand.
      () => {
        setIsLocating(false)
        setCanLocate(false)
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  }

  const Icon = ICONS[status.tone]
  return (
    <div className="flex flex-col gap-3">
      <PlaceSearch near={point} onPick={setTarget} />
      <ServiceAreaMap
        shapes={shapes}
        tilesUrl={tilesUrl}
        devWarning={devWarning}
        pin={{ start, target, onSettle: settle }}
        className="h-72 lg:h-96"
      />
      <input type="hidden" name="lat" value={point.lat} />
      <input type="hidden" name="lng" value={point.lng} />
      <div role="status" aria-live="polite" className="flex flex-col gap-1">
        {label && <p className="text-base font-semibold">{label}</p>}
        <Note
          tone={status.tone === 'checking' ? 'info' : status.tone}
          variant="plain"
          icon={
            <Icon
              aria-hidden="true"
              className={
                status.tone === 'checking'
                  ? 'mt-px size-4.5 shrink-0 animate-spin'
                  : 'mt-px size-4.5 shrink-0'
              }
            />
          }
        >
          {status.text}
        </Note>
      </div>
      {error && <FieldError id="lat-error">{error}</FieldError>}
      {canLocate && (
        <Button
          type="button"
          variant="outline"
          isDisabled={isLocating}
          onPress={locate}
          className="h-11 gap-2 self-start"
        >
          <IconCurrentLocation aria-hidden="true" className="size-5" />
          {isLocating ? 'Mencari lokasi…' : 'Gunakan lokasi saya'}
        </Button>
      )}
    </div>
  )
}
