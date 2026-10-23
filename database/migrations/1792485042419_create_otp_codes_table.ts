/*
 * otp_codes: WhatsApp verification codes for sign up, password reset and phone change.
 *
 * - purpose: which flow the code belongs to (OtpPurpose enum); a sign-up code cannot be
 *   used to reset a password.
 * - code_hash: HMAC of the 6 digits, never the code itself.
 * - attempts: wrong guesses; the code dies after 5.
 * - expires_at: 5 minutes after sending.
 * - consumed_at: set when the code is used, so it cannot be used twice.
 *
 * Index (phone, purpose, created_at): every lookup asks for the latest code of one number
 * and one purpose.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'otp_codes'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('phone', 15).notNullable()
      table.string('purpose').notNullable()
      table.string('code_hash', 64).notNullable()
      table.smallint('attempts').notNullable().defaultTo(0)
      table.timestamp('expires_at').notNullable()
      table.timestamp('consumed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.index(['phone', 'purpose', 'created_at'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
