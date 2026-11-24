import { useState } from 'react'
import { IconInfoCircle } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'

// The credits every map carries (MAP-2, AREA-1: ODbL and CC BY-IGO 3.0 §3(b), §4(a)), folded into a
// 44 px ⓘ button in the map's corner that opens the full text (D109).
export default function MapCredits() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="pointer-events-none absolute right-16 bottom-2 left-2 flex items-end gap-1 *:pointer-events-auto">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Tampilkan atribusi"
        aria-expanded={isOpen}
        aria-controls="map-credits"
        onPress={() => setIsOpen((open) => !open)}
        className="size-11 shrink-0 rounded-full shadow-md"
      >
        <IconInfoCircle aria-hidden="true" className="size-5" />
      </Button>
      {isOpen && (
        <p
          id="map-credits"
          className="rounded-md bg-background px-2 py-1 text-xs text-foreground shadow-md"
        >
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            © OpenStreetMap contributors
          </a>
          {' · Batas kecamatan: '}
          <a
            href="https://data.humdata.org/dataset/cod-ab-idn"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            BPS via OCHA/HDX
          </a>
          {', '}
          <a
            href="https://creativecommons.org/licenses/by/3.0/igo/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            CC BY-IGO 3.0
          </a>
          , diubah
        </p>
      )}
    </div>
  )
}
