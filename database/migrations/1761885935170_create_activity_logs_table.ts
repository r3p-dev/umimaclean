/*
 * activity_logs: audit trail of staff and owner actions (ORD-4, OWN-1, STAFF-1).
 * - user_id references users.id on delete set null (nullable).
 * - order_id references the relevant order when applicable (nullable).
 * - category groups activities (auth, order, payment, service, setting, staff, cost).
 * - action identifies the specific operation.
 * - description provides human-readable context in Indonesian.
 * - is_sensitive flags corrections and deletions for owner attention.
 * - created_at is timestamptz.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activity_logs'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.integer('order_id').nullable()
      table.string('category', 50).notNullable()
      table.string('action', 50).notNullable()
      table.text('description').notNullable()
      table.boolean('is_sensitive').notNullable().defaultTo(false)

      table.timestamp('created_at', { useTz: true }).notNullable()

      table.index(['user_id'])
      table.index(['order_id'])
      table.index(['category'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
