import env from '#start/env'

export type Point = { lat: number; lng: number }

export type GeocodedAddress = Partial<
  Record<
    'town' | 'city' | 'county' | 'municipality' | 'district' | 'city_district' | 'village',
    string
  >
>

export abstract class Geocoder {
  abstract reverse(point: Point): Promise<GeocodedAddress | null>
}

export class NominatimGeocoder extends Geocoder {
  async reverse(point: Point) {
    const params = new URLSearchParams({
      'lat': String(point.lat),
      'lon': String(point.lng),
      'format': 'jsonv2',
      'zoom': '12',
      'addressdetails': '1',
      'accept-language': 'id',
    })

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: { 'user-agent': `UmimaClean/1.0 (${env.get('APP_URL')})` },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) {
      throw new Error(`Nominatim responded ${response.status}`)
    }

    const body = (await response.json()) as { address?: GeocodedAddress; error?: string }

    return body.error || !body.address ? null : body.address
  }
}
