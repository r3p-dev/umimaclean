/*
 * bills: the bill of an order, created when staff finish the inspection.
 *
 * - order_id: unique, an order has at most one bill (re-inspection replaces it).
 * - total: sum of the bill lines, stored once because payments, reports and every order
 *   screen read it.
 * - decided_by: the staff member who priced the items; SET NULL keeps the bill if the
 *   account is removed.
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
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
