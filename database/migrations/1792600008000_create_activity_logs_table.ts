/*
 * activity_logs: the owner's audit log of what staff and the owner did.
 *
 * Separate from order_events because it also records actions that are not about one
 * order (price changes, staff accounts, sign-ins) and holds detail meant for the owner.
 * Customer actions are not logged here.
 * - action: what happened (ActivityAction enum).
 * - order_id: the order involved, if any.
 * - detail: human-readable summary, e.g. "Mild Rp60.000 → Rp65.000".
 * - is_sensitive: flags corrections and deletions so the owner can filter for them.
 *
 * Indexes: created_at (the log is read newest first), (actor_id, created_at) (one staff
 * member's history).
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activity_logs'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('actor_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table
        .integer('order_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE')
      table.string('action').notNullable()
      table.string('detail', 300).notNullable().defaultTo('')
      table.boolean('is_sensitive').notNullable().defaultTo(false)
      table.timestamp('created_at').notNullable().index()
      table.index(['actor_id', 'created_at'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
