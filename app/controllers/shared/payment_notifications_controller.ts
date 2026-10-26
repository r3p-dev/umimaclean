import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import MidtransGateway, { midtransStatus } from '#services/midtrans_gateway'
import PaymentService from '#services/payment_service'

@inject()
export default class PaymentNotificationsController {
  constructor(
    protected gateway: MidtransGateway,
    protected payments: PaymentService
  ) {}

  async store({ request, response }: HttpContext) {
    const notification = midtransStatus(request.body())
    if (!this.gateway.verifySignature(notification)) {
      return response.forbidden({ message: 'Invalid signature' })
    }

    await this.payments.handlePaymentNotification(notification)
    return response.ok({ message: 'OK' })
  }
}
