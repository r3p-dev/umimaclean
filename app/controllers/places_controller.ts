import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PlaceService from '#services/place_service'
import { checkPointValidator } from '#validators/address_validator'
import { searchPlacesValidator } from '#validators/place_validator'

// JSON endpoints for the pin form (MAP-1); `isAvailable` is false while the `osm` data is missing.
@inject()
export default class PlacesController {
  constructor(protected placeService: PlaceService) {}

  async index({ request }: HttpContext) {
    const { q, lat, lng } = await request.validateUsing(searchPlacesValidator)
    const places = q
      ? await this.placeService.searchPlaces(q, { lat, lng })
      : await this.placeService.findNearbyPlaces({ lat, lng })

    return { isAvailable: places !== null, places: places ?? [] }
  }

  async show({ request }: HttpContext) {
    const point = await request.validateUsing(checkPointValidator)
    const label = await this.placeService.describePoint(point)

    return { street: label?.street ?? null, kelurahan: label?.kelurahan ?? null }
  }
}
