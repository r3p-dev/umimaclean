/*
 * bill_lines: one row per service charged on one item of a bill.
 *
 * - order_item_id: the item the service was done on.
 * - service_id: the price-list entry it came from; its type (main or add-on) is read from
 *   there. Services are only soft-deleted, so the row always exists.
 * - name, price: copied from the price list at inspection time. The owner changes prices
 *   and names later, and an old bill must keep what the customer was charged.
 *
 * Index on bill_id: lines are always read per bill.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bill_lines'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('bill_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('bills')
        .onDelete('CASCADE')
      table
        .integer('order_item_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('order_items')
        .onDelete('CASCADE')
      table
        .integer('service_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('services')
        .onDelete('SET NULL')
      table.string('name', 60).notNullable()
      table.integer('price').notNullable()
      table.index(['bill_id'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
