import { useEffect, useState } from 'react'
import type { Registry } from '@generated/registry/schema'
import { urlFor } from '~/client'
import type { MapPoint } from '~/lib/map/area_map'

type CheckResponse = Registry['area.check_point']['types']['response']
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
// Taps and keys come quickly one after another; only the point where they stop is checked.
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

const CHECK_FAILED: PinCheck = {
  tone: 'attention',
  text: 'Pengecekan area gagal. Periksa koneksi Anda.',
  isCovered: null,
  district: null,
}

// AREA-4: whether the server says `point` is inside an active service area, asked again each time the
// point changes. "Mengecek area…" until the answer for this very point arrives.
export function usePinCheck(point: MapPoint): PinCheck {
  const [answer, setAnswer] = useState<{ point: MapPoint; check: PinCheck } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      checkPoint(point, controller.signal)
        .then((check) => setAnswer({ point, check }))
        .catch((checkError: unknown) => {
          // The pin moved again and aborted this check; its answer no longer matters.
          if (controller.signal.aborted) return
          console.error(checkError)
          setAnswer({ point, check: CHECK_FAILED })
        })
    }, SETTLE_PAUSE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [point])

  return answer?.point === point ? answer.check : CHECKING
}
