import type { HttpContext } from '@adonisjs/core/http'
import OrderNotFoundException from '#exceptions/order_not_found_exception'
import OrderPhoto from '#models/order_photo'
import OrderPolicy from '#policies/order_policy'
import { proofPath } from '#services/proof_photo_service'

export default class ProofPhotosController {
  async show({ bouncer, params, response }: HttpContext) {
    const photo = await OrderPhoto.query()
      .where('id', Number(params.id) || 0)
      .preload('order')
      .first()
    if (!photo?.path || !(await bouncer.with(OrderPolicy).allows('follow', photo.order))) {
      throw new OrderNotFoundException()
    }

    response.header('cache-control', 'private, max-age=86400')
    return response.download(proofPath(photo.path))
  }
}
