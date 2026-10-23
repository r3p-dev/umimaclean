import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import OrderPhoto, { PHOTO_RETENTION_DAYS } from '#models/order_photo'

export default class PruneProofPhotos extends BaseCommand {
  static override commandName = 'proofs:prune'
  static override description = `Delete proof photos older than ${PHOTO_RETENTION_DAYS} days (run daily from cron)`
  static override options: CommandOptions = { startApp: true }

  @flags.number({ description: 'Retention in days' })
  declare days?: number

  override async run() {
    const pruned = await OrderPhoto.prune(this.days ?? PHOTO_RETENTION_DAYS)
    this.logger.info(`${pruned} proof photo(s) deleted`)
  }
}
