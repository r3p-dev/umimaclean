/*
 * otp_codes: WhatsApp verification codes for sign-up, password reset, and phone change.
 *
 * - purpose: which flow the code belongs to (OtpPurpose enum: register, reset_password, change_phone).
 * - code_hash: HMAC-SHA256 of the 6 digits using APP_KEY; the plain code is never stored or logged.
 * - attempts: failed verification attempts; code is locked and dead after 5 wrong tries.
 * - expires_at: valid for 5 minutes after issuance.
 * - consumed_at: set when the code is successfully verified, preventing replay.
 * Index on (phone, purpose, created_at) for efficient retrieval of the latest active code.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'otp_codes'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('phone', 15).notNullable()
      table.string('purpose', 30).notNullable()
      table.string('code_hash', 64).notNullable()
      table.smallint('attempts').notNullable().defaultTo(0)
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('consumed_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()

      table.index(['phone', 'purpose', 'created_at'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
