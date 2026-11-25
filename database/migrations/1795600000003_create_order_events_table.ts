/*
 * order_events: an order's timeline (ORD-4). `OrderService` appends one row for the order's first
 * status and one for every change after it; rows are never edited or deleted.
 *
 * - status: the status the order entered.
 * - actor_id: who made the change; null when the system did.
 * - note: optional, for example the reason of a cancellation or a skipped trip.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_events'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('order_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE')
      table.string('status', 30).notNullable()
      table
        .integer('actor_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.string('note', 300).nullable()
      table.timestamp('created_at').notNullable()

      table.index(['order_id'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
