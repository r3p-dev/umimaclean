import type { ApplicationService } from '@adonisjs/core/types'
import { Geocoder, NominatimGeocoder } from '#services/geocoder_service'

export default class GeocoderProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton(Geocoder, () => new NominatimGeocoder())
  }
}
