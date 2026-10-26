import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import ReminderService from '#services/reminder_service'

export default class RemindPayment extends BaseCommand {
  static override commandName = 'orders:remind-payment'
  static override description =
    'Send due WhatsApp payment reminders for unpaid online orders (run every 15 minutes)'
  static override options: CommandOptions = { startApp: true }

  override async run() {
    const reminders = await this.app.container.make(ReminderService)
    const sent = await reminders.sendDueReminders()
    this.logger.info(`${sent} payment reminder(s) sent`)
  }
}
