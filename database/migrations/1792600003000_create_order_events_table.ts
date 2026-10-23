/*
 * order_events: the order timeline shown to the customer, one row per status change.
 *
 * Append-only: rows are never updated, so the timeline is a faithful history.
 * - status: the status the order moved to.
 * - actor_id: who made the change (customer, staff, owner); null for the system, e.g. a
 *   payment webhook. SET NULL keeps the event if the account is removed.
 * - note: short text for the customer, e.g. the skip reason or who received the delivery.
 *
 * Index (order_id, id): the timeline is read per order in insertion order.
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
      table.string('status').notNullable()
      table
        .integer('actor_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('note', 300).nullable()
      table.timestamp('created_at').notNullable()
      table.index(['order_id', 'id'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
