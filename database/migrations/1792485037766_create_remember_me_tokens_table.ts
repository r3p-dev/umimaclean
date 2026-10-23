/*
 * remember_me_tokens: the "Ingat saya" tokens of the AdonisJS session guard (180 days).
 *
 * - hash: only the token hash is stored, unique so a cookie maps to exactly one row.
 * - tokenable_id cascades on delete: removing a user removes their remembered devices.
 *
 * Deleting a user's rows signs every remembered device out (password reset and
 * "log out other devices").
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'remember_me_tokens'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('tokenable_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('hash').notNullable().unique()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.timestamp('expires_at').notNullable()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
