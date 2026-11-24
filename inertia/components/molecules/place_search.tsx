import { useEffect, useRef, useState } from 'react'
import { Autocomplete, TextField } from 'react-aria-components'
import type { Registry } from '@generated/registry/schema'
import { urlFor } from '~/client'
import { ComboboxEmpty, ComboboxItem, ComboboxList } from '~/components/ui/combobox'
import { FieldError } from '~/components/ui/field'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import type { MapPoint } from '~/lib/map/area_map'

type Place = Registry['places.index']['types']['response']['places'][number]
// The JSON body of a refused search: @adonisjs/limiter's 429 and VineJS's 422 (D80).
type ErrorBody = { errors: { message: string }[] }
type Answer = { places: Place[]; message: string }

const SEARCHING: Answer = { places: [], message: 'Mencari…' }
// The server's minimum (searchPlacesValidator).
const MIN_QUERY_LENGTH = 3
// Search starts once the customer pauses typing; every pause is one request within D80's limit.
const TYPING_PAUSE_MS = 400

async function askPlaces(query: string, near: MapPoint, signal: AbortSignal): Promise<Answer> {
  const response = await fetch(urlFor('places.index', {}, { qs: { q: query, ...near } }), {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (response.status === 429 || response.status === 422) {
    const body: ErrorBody = await response.json()
    return { places: [], message: body.errors[0].message }
  }
  if (!response.ok) {
    return { places: [], message: 'Pencarian gagal. Lanjutkan mengetik, lalu atur pin di peta.' }
  }
  const { isAvailable, places } = await response.json()
  if (!isAvailable) {
    return { places: [], message: 'Pencarian tempat belum tersedia. Atur pin di peta.' }
  }
  return { places, message: 'Tidak ditemukan di peta. Lanjutkan mengetik, lalu atur pin di peta.' }
}

// CUST-3, MAP-1: "Nama jalan, gedung, no. rumah", saved as `addressText`, is also the place search
// (D110). Typing lists matching places under the field; choosing one writes its full name into the
// field and moves the pin there, and the customer adds the house number after it.
export default function PlaceSearch({
  defaultValue,
  near,
  error,
  onPick,
}: {
  defaultValue: string
  near: MapPoint
  error?: string
  onPick: (point: MapPoint) => void
}) {
  const [text, setText] = useState(defaultValue)
  // False once the customer types; true again after a pick or Escape, so that text is not searched.
  const [isSettled, setIsSettled] = useState(true)
  const [isFocused, setIsFocused] = useState(false)
  const [answer, setAnswer] = useState<Answer>(SEARCHING)
  // Read when a search starts: moving the pin alone must not search again.
  const nearRef = useRef(near)
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    nearRef.current = near
  })

  const trimmed = text.trim()
  const isSearching = !isSettled && trimmed.length >= MIN_QUERY_LENGTH

  useEffect(() => {
    if (!isSearching) {
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      askPlaces(trimmed, nearRef.current, controller.signal)
        .then(setAnswer)
        .catch((searchError: unknown) => {
          // A newer keystroke aborted this search; its answer no longer matters.
          if (controller.signal.aborted) return
          console.error(searchError)
          setAnswer({ places: [], message: 'Pencarian gagal. Periksa koneksi Anda.' })
        })
    }, TYPING_PAUSE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [isSearching, trimmed])

  function pick(id: unknown) {
    const place = answer.places.find((candidate) => candidate.id === id)
    if (place) {
      setText(place.fullName)
      setIsSettled(true)
      onPick({ lat: place.lat, lng: place.lng })
    }
  }

  return (
    // Autocomplete keeps focus in the field and moves through the list with the arrow keys; the
    // first suggestion is not chosen on its own, so Enter still starts a new line.
    <Autocomplete
      inputValue={text}
      onInputChange={(value) => {
        setAnswer(SEARCHING)
        setText(value)
        setIsSettled(false)
      }}
      disableAutoFocusFirst
    >
      <TextField
        name="addressText"
        isRequired
        maxLength={300}
        isInvalid={error ? true : undefined}
        onFocus={() => setIsFocused(true)}
        // Autocomplete also sends a blur when its virtual focus moves into the list; that one keeps
        // the list open.
        onBlur={(event) => setIsFocused(listRef.current?.contains(event.relatedTarget) ?? false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsSettled(true)
          }
        }}
        className="relative flex flex-col gap-3"
      >
        <Label>Nama jalan, gedung, no. rumah</Label>
        <Textarea
          placeholder="Ketik nama jalan, mis. Dipatiukur, lalu pilih dari daftar"
          aria-describedby={error ? 'addressText-error' : undefined}
          className="min-h-20"
        />
        {isFocused && isSearching && (
          <div
            ref={listRef}
            className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10"
          >
            <ComboboxList<Place>
              aria-label="Saran tempat"
              items={answer.places}
              onAction={pick}
              renderEmptyState={() => <ComboboxEmpty>{answer.message}</ComboboxEmpty>}
            >
              {(place) => (
                <ComboboxItem
                  id={place.id}
                  textValue={place.fullName}
                  className="min-h-11 text-base"
                >
                  <span className="flex flex-col">
                    <span>{place.name}</span>
                    {place.detail && (
                      <span className="text-sm text-muted-foreground">{place.detail}</span>
                    )}
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </div>
        )}
        {error && <FieldError id="addressText-error">{error}</FieldError>}
      </TextField>
    </Autocomplete>
  )
}
