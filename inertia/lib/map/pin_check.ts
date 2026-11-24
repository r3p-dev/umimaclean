import { useEffect, useState } from 'react'
import type { Registry } from '@generated/registry/schema'
import { urlFor } from '~/client'
import type { MapPoint } from '~/lib/map/area_map'

type CheckResponse = Registry['area.check_point']['types']['response']
type LabelResponse = Registry['places.show']['types']['response']
// The JSON bodies of a refused check: @adonisjs/limiter's 429 and VineJS's 422 (D80).
type ErrorBody = { errors: { message: string }[] }

export type PinCheck = {
  tone: 'checking' | 'attention' | 'success' | 'danger'
  text: string
  isCovered: boolean | null
  // The kecamatan under the pin (active or not), as the server stores it; null outside them all.
  district: CheckResponse['district']
}

const CHECKING: PinCheck = {
  tone: 'checking',
  text: 'Mengecek area…',
  isCovered: null,
  district: null,
}
// Taps and keys come quickly one after another; only the point where they stop is asked about.
const SETTLE_PAUSE_MS = 300

async function checkPoint(point: MapPoint, signal: AbortSignal): Promise<PinCheck> {
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

// The server's answer about `point`, asked again each time the point changes; null until the answer
// for this very point arrives. A failed request answers `onError`.
function usePointAnswer<T>(
  point: MapPoint,
  ask: (point: MapPoint, signal: AbortSignal) => Promise<T>,
  onError: T
): T | null {
  const [answer, setAnswer] = useState<{ point: MapPoint; value: T } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      ask(point, controller.signal)
        .then((value) => setAnswer({ point, value }))
        .catch((askError: unknown) => {
          // The pin moved again and aborted this request; its answer no longer matters.
          if (controller.signal.aborted) return
          console.error(askError)
          setAnswer({ point, value: onError })
        })
    }, SETTLE_PAUSE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [point, ask, onError])

  return answer?.point === point ? answer.value : null
}

const CHECK_FAILED: PinCheck = {
  tone: 'attention',
  text: 'Pengecekan area gagal. Periksa koneksi Anda.',
  isCovered: null,
  district: null,
}
const NO_LABEL: LabelResponse = { street: null, kelurahan: null }

// AREA-4: whether the server says `point` is inside an active service area; "Mengecek area…" until
// the answer for this point arrives.
export function usePinCheck(point: MapPoint): PinCheck {
  return usePointAnswer(point, checkPoint, CHECK_FAILED) ?? CHECKING
}

// MAP-1: the street and kelurahan our OSM data names under `point` (`GET /tempat/titik`).
export function usePinLabel(point: MapPoint): LabelResponse {
  return usePointAnswer(point, readLabel, NO_LABEL) ?? NO_LABEL
}
