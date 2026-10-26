import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import OrderPolicy from '#policies/order_policy'
import OrderService from '#services/order_service'

@inject()
export default class ProofPhotosController {
  constructor(protected orders: OrderService) {}

  async show({ bouncer, params, response, session }: HttpContext) {
    const photo = await this.orders.findProofPhoto(Number(params.id) || 0)
    const isUnlocked = !!photo && this.orders.isTrackingUnlocked(session, photo.order)
    if (
      !photo?.path ||
      !(await bouncer.with(OrderPolicy).allows('follow', photo.order, isUnlocked))
    ) {
      throw new Exception('Pesanan tidak ditemukan', { status: 404 })
    }

    response.header('cache-control', 'private, max-age=86400')
    return response.download(this.orders.proofPhotoPath(photo.path))
  }
}
