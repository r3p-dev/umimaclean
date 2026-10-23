/*
 * users: every account (customer, staff and owner) signs in here with a WhatsApp number.
 *
 * - role: 'customer', 'staff' or 'admin' (Role enum). Stored as a plain string, typed in
 *   schema_rules.ts, so adding a role never needs a migration.
 * - phone: normalized to 628..., it is the login uid, hence unique.
 * - phone_verified_at: set once the WhatsApp OTP is confirmed; staff created by the owner
 *   start unverified.
 * - password_changed_at: shown on the profile page ("changed 3 days ago").
 * - staff_type, shift: staff sub-type and work shift shown on the owner's staff list.
 * - is_active: the owner can switch a staff account off without deleting its history.
 * - last_seen_at: last staff sign-in, shown on the owner's staff list.
 *
 * Index on role: the owner's staff list and the customer list filter by role.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('role').notNullable().index()
      table.string('name', 80).notNullable()
      table.string('phone', 15).notNullable().unique()
      table.string('password').notNullable()
      table.timestamp('phone_verified_at').nullable()
      table.timestamp('password_changed_at').nullable()
      table.string('staff_type').nullable()
      table.string('shift').nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('last_seen_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
