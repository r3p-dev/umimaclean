import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PlaceService from '#services/place_service'
import PlaceTransformer from '#transformers/place_transformer'
import { checkAreaValidator } from '#validators/shared/area'
import { searchPlacesValidator } from '#validators/shared/place'

@inject()
export default class PlacesController {
  constructor(protected place: PlaceService) {}

  async index({ request }: HttpContext) {
    const { q, ...near } = await request.validateUsing(searchPlacesValidator, {
      data: request.qs(),
    })
    const places = q
      ? await this.place.searchPlaces(q, near)
      : await this.place.findNearbyPlaces(near)
    return places.map((place) => new PlaceTransformer(place).toObject())
  }

  async show({ request }: HttpContext) {
    const point = await request.validateUsing(checkAreaValidator, { data: request.qs() })
    return { address: await this.place.describePoint(point) }
  }
}
