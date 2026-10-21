import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { midtransStatus, PaymentGateway } from '#services/payment/payment_gateway'
import PaymentService from '#services/payment/payment_service'

@inject()
export default class PaymentNotificationsController {
  constructor(
    protected gateway: PaymentGateway,
    protected payments: PaymentService
  ) {}

  async store({ request, response }: HttpContext) {
    const notification = midtransStatus(request.body())
    if (!this.gateway.verify(notification)) {
      return response.forbidden({ message: 'Invalid signature' })
    }

    await this.payments.handleNotification(notification)
    return response.ok({ message: 'OK' })
  }
}
