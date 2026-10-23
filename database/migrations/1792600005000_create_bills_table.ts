/*
 * bills: the bill of an order, created when staff finish the inspection.
 *
 * - order_id: unique, an order has at most one bill (re-inspection replaces it).
 * - total: sum of the bill lines, stored once because payments, reports and every order
 *   screen read it.
 * - decided_by: the staff member who priced the items; SET NULL keeps the bill if the
 *   account is removed.
 * - reminder_count, last_reminded_at: the automatic WhatsApp payment reminders for online
 *   orders (`node ace orders:remind-payment`). The next one is due 24 hours after the bill
 *   (created_at) and then 2 days after last_reminded_at. Only a sent message updates them,
 *   so a failed send is retried on the next run.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bills'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('order_id')
        .notNullable()
        .unsigned()
        .unique()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE')
      table.integer('total').notNullable()
      table
        .integer('decided_by')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.smallint('reminder_count').notNullable().defaultTo(0)
      table.timestamp('last_reminded_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
