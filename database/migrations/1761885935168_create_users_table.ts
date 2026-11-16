/*
 * users: every account that can sign in (customer, staff, owner/admin).
 * - full_name is required.
 * - phone is the sign-in identifier normalized to 62... (ACC-1), unique.
 * - password holds the scrypt hash, never plain text.
 * - role is customer, staff, or admin (Role enum).
 * - is_active allows disabling accounts (ACC-3).
 * - last_seen_at tracks staff/owner activity (STAFF-1).
 * - created_at / updated_at are timestamptz.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'
import { Role } from '#enums/role_enum'

export default class extends BaseSchema {
  protected tableName = 'users'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('full_name').notNullable()
      table.string('phone', 20).notNullable()
      table.string('password').notNullable()
      table.string('role', 20).notNullable().defaultTo(Role.CUSTOMER)
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('last_seen_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.unique(['phone'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
