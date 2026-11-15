/*
 * remember_me_tokens: persistent login tokens (ACC-3).
 * - tokenable_id references users.id on delete cascade.
 * - hash stores the sha256 hash of the token secret.
 * - expires_at is set to 180 days from issue.
 * - created_at / updated_at are timestamptz.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'remember_me_tokens'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('tokenable_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('hash').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()

      table.index(['tokenable_id'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
