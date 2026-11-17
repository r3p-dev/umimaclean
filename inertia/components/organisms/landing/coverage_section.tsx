import { useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { IconCurrentLocation } from '@tabler/icons-react'
import type { Data } from '@generated/data'
import type { Registry } from '@generated/registry/schema'
import { urlFor } from '~/client'
import Note from '~/components/atoms/note'
import ServiceAreaMap, { type MapPoint } from '~/components/organisms/service_area_map'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'

type CoverageResult = Registry['area.check']['types']['response']
// The JSON body @adonisjs/limiter sends with a 429 (D80).
type ThrottledBody = { errors: { message: string }[] }

type CheckState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'done'; result: CoverageResult }
  | { kind: 'error'; message: string }

const CITY_ORDER: Data.ServiceAreaShape['city'][] = [
  'Kota Bandung',
  'Kota Cimahi',
  'Kabupaten Bandung',
]

// One request after the pin stops; a drag that ends and starts again within this time sends none.
const CHECK_DELAY_MS = 300

function servedCities(shapes: Data.ServiceAreaShape[]) {
  return CITY_ORDER.flatMap((city) => {
    const inCity = shapes.filter((area) => area.city === city)
    const active = inCity.filter((area) => area.isActive).length
    if (active === 0) {
      return []
    }
    return [active === inCity.length ? city : `${city} (sebagian)`]
  })
}

async function checkCoverage(point: MapPoint): Promise<CheckState> {
  const response = await fetch(urlFor('area.check', {}, { qs: point }), {
    headers: { Accept: 'application/json' },
  })
  if (response.status === 429) {
    const body: ThrottledBody = await response.json()
    return { kind: 'error', message: body.errors[0].message }
  }
  if (!response.ok) {
    return { kind: 'error', message: 'Pengecekan gagal. Coba lagi.' }
  }
  return { kind: 'done', result: await response.json() }
}

function CheckMessage({ state }: { state: CheckState }) {
  if (state.kind === 'idle') {
    return <Note tone="info">Geser pin ke lokasi Anda, atau gunakan lokasi Anda.</Note>
  }
  if (state.kind === 'checking') {
    return <Note tone="info">Memeriksa lokasi…</Note>
  }
  if (state.kind === 'error') {
    return <Note tone="attention">{state.message}</Note>
  }

  const { isCovered, district } = state.result
  if (isCovered && district) {
    return (
      <Note tone="success">
        Terjangkau: Kecamatan {district.name}, {district.city}.
      </Note>
    )
  }
  if (district) {
    return (
      <Note tone="attention">
        Kecamatan {district.name}, {district.city} belum terjangkau.
      </Note>
    )
  }
  return <Note tone="attention">Lokasi ini di luar area layanan.</Note>
}

export default function CoverageSection({
  areaShapes,
  tilesUrl,
}: {
  areaShapes: Data.ServiceAreaShape[] | undefined
  tilesUrl: string | null
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const checkTimer = useRef<number | undefined>(undefined)
  const [isNear, setIsNear] = useState(false)
  const [pinPosition, setPinPosition] = useState<MapPoint | null>(null)
  const [state, setState] = useState<CheckState>({ kind: 'idle' })

  // The map, its library and the district shapes load only when this section comes near (NFR-3).
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect()
          setIsNear(true)
          router.reload({ only: ['areaShapes'] })
        }
      },
      { rootMargin: '400px' }
    )
    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
    return () => observer.disconnect()
  }, [])

  async function runCheck(point: MapPoint) {
    setState({ kind: 'checking' })
    try {
      setState(await checkCoverage(point))
    } catch {
      setState({ kind: 'error', message: 'Pengecekan gagal. Periksa koneksi Anda lalu coba lagi.' })
    }
  }

  function handlePinStop(point: MapPoint) {
    window.clearTimeout(checkTimer.current)
    checkTimer.current = window.setTimeout(() => runCheck(point), CHECK_DELAY_MS)
  }

  function locate() {
    if (!('geolocation' in navigator)) {
      setState({
        kind: 'error',
        message: 'Lokasi tidak tersedia di browser ini. Geser pin ke lokasi Anda.',
      })
      return
    }
    setState({ kind: 'checking' })
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const point = { lat: coords.latitude, lng: coords.longitude }
        setPinPosition(point)
        runCheck(point)
      },
      () =>
        setState({
          kind: 'error',
          message: 'Lokasi tidak bisa diambil. Geser pin ke lokasi Anda.',
        }),
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  }

  return (
    <section
      ref={sectionRef}
      id="area-layanan"
      aria-labelledby="area-layanan-heading"
      className="bg-background py-16 sm:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-6 px-5 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-4">
          <h2
            id="area-layanan-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Area Layanan
          </h2>
          {areaShapes && (
            <ul className="flex flex-wrap gap-2" aria-label="Kota dan kabupaten yang dilayani">
              {servedCities(areaShapes).map((label) => (
                <li key={label}>
                  <Badge variant="outline" className="h-8 px-3 text-sm">
                    {label}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Button variant="outline" onPress={locate} className="h-11 self-start text-base">
            <IconCurrentLocation />
            Gunakan lokasi saya
          </Button>
          <div role="status" aria-live="polite">
            <CheckMessage state={state} />
          </div>
        </div>
        {isNear && (
          <ServiceAreaMap
            shapes={areaShapes}
            tilesUrl={tilesUrl}
            pinPosition={pinPosition}
            onPinStop={handlePinStop}
            hasCooperativeGestures
            className="h-80 sm:h-96"
          />
        )}
      </div>
    </section>
  )
}
