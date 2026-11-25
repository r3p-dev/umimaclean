import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PlaceService from '#services/place_service'
import { searchPlacesValidator } from '#validators/place_validator'

// JSON endpoint for the pin form (MAP-1); `isAvailable` is false while the `osm` data is missing.
@inject()
export default class PlacesController {
  constructor(protected placeService: PlaceService) {}

  async index({ request }: HttpContext) {
    const { q, lat, lng } = await request.validateUsing(searchPlacesValidator)
    const places = await this.placeService.searchPlaces(q, { lat, lng })

    return { isAvailable: places !== null, places: places ?? [] }
  }
}
