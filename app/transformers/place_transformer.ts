import { BaseTransformer } from '@adonisjs/core/transformers'
import type { PlaceRow } from '#services/types'

function unique(parts: (string | null)[], exclude: string[]) {
  const seen = new Set(exclude.map((part) => part.toLowerCase()))
  return parts.filter((part): part is string => {
    if (!part || seen.has(part.toLowerCase())) {
      return false
    }
    seen.add(part.toLowerCase())
    return true
  })
}

export default class PlaceTransformer extends BaseTransformer<PlaceRow> {
  toObject() {
    const place = this.resource
    const kecamatan = place.kecamatan && `Kec. ${place.kecamatan}`
    return {
      id: `${place.kind}-${place.id}`,
      title: place.name,
      detail: unique([place.street, place.kelurahan, kecamatan, place.city], [place.name]).join(
        ', '
      ),
      value: unique(
        [place.name, place.street, place.kelurahan, place.kecamatan, place.city],
        []
      ).join(', '),
      point: { lat: place.lat, lng: place.lng },
    }
  }
}
