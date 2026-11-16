/*
 * rate_limits: database storage for @adonisjs/limiter.
 *
 * Stores keys, request counts, and expiry times for rate limits and cooldowns.
 * - key: composite key of limited action and target (e.g. otp_cooldown_628...).
 * - points: request count in current window.
 * - expire: window expiration in milliseconds since epoch.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rate_limits'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('key', 255).notNullable().primary()
      table.integer('points', 9).notNullable().defaultTo(0)
      table.bigint('expire').unsigned().nullable()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
