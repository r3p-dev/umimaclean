/*
 * rate_limits: storage for @adonisjs/limiter (login, OTP, QRIS and similar limits).
 *
 * The shape (key, points, expire) is the one the limiter's database store expects.
 * - key: the limited action plus who does it, e.g. "login_phone_628...".
 * - points: requests used in the current window.
 * - expire: when the window ends, in milliseconds since epoch.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rate_limits'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('key', 255).notNullable().primary()
      table.integer('points', 9).notNullable().defaultTo(0)
      table.bigint('expire').unsigned()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
