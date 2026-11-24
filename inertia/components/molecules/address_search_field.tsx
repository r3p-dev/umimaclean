import { useEffect, useState } from 'react'
import type { Registry } from '@generated/registry/schema'
import { urlFor } from '~/client'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '~/components/ui/combobox'
import { Label } from '~/components/ui/label'
import type { MapPoint } from '~/lib/map/area_map'

type Place = Registry['places.index']['types']['response']['places'][number]
// The JSON body of a refused search: @adonisjs/limiter's 429 and VineJS's 422 (D80).
type ErrorBody = { errors: { message: string }[] }
type Answer = { places: Place[]; message: string }

const SEARCHING: Answer = { places: [], message: 'Mencari…' }
// The server's minimum (searchPlacesValidator); shorter input lists the places near the pin.
const MIN_QUERY_LENGTH = 3
// Search starts once the customer pauses typing; every pause is one request within D80's limit.
const TYPING_PAUSE_MS = 400

async function askPlaces(query: string, near: MapPoint, signal: AbortSignal): Promise<Answer> {
  const qs = query ? { q: query, ...near } : near
  const response = await fetch(urlFor('places.index', {}, { qs }), {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (response.status === 429 || response.status === 422) {
    const body: ErrorBody = await response.json()
    return { places: [], message: body.errors[0].message }
  }
  if (!response.ok) {
    return { places: [], message: 'Pencarian gagal. Coba lagi atau geser peta.' }
  }
  const { isAvailable, places } = await response.json()
  if (!isAvailable) {
    return {
      places: [],
      message: 'Pencarian tempat belum tersedia. Geser peta untuk menaruh titik.',
    }
  }
  return {
    places,
    message: query
      ? 'Tidak ditemukan. Coba nama jalan atau tempat lain, atau geser peta.'
      : 'Belum ada tempat di sekitar titik ini.',
  }
}

// MAP-1: search a street or place by name, or pick one near the pin; picking only moves the map.
export default function PlaceSearch({
  near,
  onPick,
}: {
  near: MapPoint
  onPick: (point: MapPoint) => void
}) {
  const [query, setQuery] = useState('')
  const [pickedName, setPickedName] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [answer, setAnswer] = useState<Answer>(SEARCHING)

  const trimmed = query.trim()
  const isSearching = trimmed.length >= MIN_QUERY_LENGTH && trimmed !== pickedName
  // Nearby places are asked only while the list is open, so moving the pin costs no request.
  const isListingNearby = isOpen && trimmed.length < MIN_QUERY_LENGTH

  useEffect(() => {
    if (!isSearching && !isListingNearby) {
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(
      () => {
        askPlaces(isSearching ? trimmed : '', near, controller.signal)
          .then(setAnswer)
          .catch((error: unknown) => {
            // A newer keystroke or pin move aborted this search; its answer no longer matters.
            if (controller.signal.aborted) return
            console.error(error)
            setAnswer({ places: [], message: 'Pencarian gagal. Periksa koneksi Anda.' })
          })
      },
      isSearching ? TYPING_PAUSE_MS : 0
    )
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [isSearching, isListingNearby, trimmed, near])

  function pick(id: unknown) {
    const place = answer.places.find((candidate) => candidate.id === id)
    if (place) {
      setPickedName(place.name)
      onPick({ lat: place.lat, lng: place.lng })
    }
  }

  return (
    <Combobox
      aria-describedby="place-search-help"
      items={answer.places}
      inputValue={query}
      onInputChange={(value) => {
        setAnswer(SEARCHING)
        setQuery(value)
      }}
      onChange={pick}
      onOpenChange={setIsOpen}
      menuTrigger="focus"
      allowsEmptyCollection
      className="flex flex-col gap-2"
    >
      <Label>Cari jalan atau tempat</Label>
      <ComboboxInput
        showTrigger={false}
        placeholder="mis. Dipatiukur"
        enterKeyHint="search"
        // Enter picks from the list; it must not submit the address form around it.
        onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
        className="h-12"
      />
      <p id="place-search-help" className="text-sm text-muted-foreground">
        Memilih hasil memindahkan peta. Alamat lengkap tetap Anda isi sendiri.
      </p>
      <ComboboxContent>
        <ComboboxList<Place>
          renderEmptyState={() => <ComboboxEmpty>{answer.message}</ComboboxEmpty>}
        >
          {(place) => (
            <ComboboxItem id={place.id} textValue={place.name} className="min-h-11 text-base">
              <span className="flex flex-col">
                <span>{place.name}</span>
                {place.detail && (
                  <span className="text-sm text-muted-foreground">{place.detail}</span>
                )}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
