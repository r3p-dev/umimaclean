/*
 * users: every account that can sign in.
 * - full_name is required at sign-up.
 * - email is the sign-in name, unique; password holds the scrypt hash, never the plain text.
 * - created_at / updated_at are timestamptz.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('full_name').notNullable()
      table.string('email', 254).notNullable()
      table.string('password').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.unique(['email'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
