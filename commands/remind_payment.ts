import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import OrderService from '#services/order_service'

export default class RemindPayment extends BaseCommand {
  static override commandName = 'orders:remind-payment'
  static override description =
    'Send due WhatsApp payment reminders for unpaid online orders (run every 15 minutes)'
  static override options: CommandOptions = { startApp: true }

  override async run() {
    const orders = await this.app.container.make(OrderService)
    const sent = await orders.sendDuePaymentReminders()
    this.logger.info(`${sent} payment reminder(s) sent`)
  }
}
