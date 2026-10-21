import type { ApplicationService } from '@adonisjs/core/types'
import { MidtransGateway, PaymentGateway } from '#services/payment/payment_gateway'

export default class PaymentProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton(PaymentGateway, () => new MidtransGateway())
  }
}
