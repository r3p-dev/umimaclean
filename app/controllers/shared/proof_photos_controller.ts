import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import OrderPhoto, { proofPath } from '#models/order_photo'
import OrderPolicy from '#policies/order_policy'

export default class ProofPhotosController {
  async show({ bouncer, params, response }: HttpContext) {
    const photo = await OrderPhoto.query()
      .where('id', Number(params.id) || 0)
      .preload('order')
      .first()
    if (!photo?.path || !(await bouncer.with(OrderPolicy).allows('follow', photo.order))) {
      throw new Exception('Pesanan tidak ditemukan', { status: 404 })
    }

    response.header('cache-control', 'private, max-age=86400')
    return response.download(proofPath(photo.path))
  }
}
