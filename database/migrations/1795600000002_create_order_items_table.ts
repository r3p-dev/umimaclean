/*
 * order_items: the items the customer declares when ordering (CUST-5), one row per item. The items
 * staff find at inspection join this table in M7.
 *
 * - item_kind: `shoe` or `bag` online (SVC-4: helmets are shop-only); walk-ins may add helmets (M9).
 * - brand: optional ("Nike"); type: required ("Air Force 1", "ransel kanvas").
 * - size: an EU shoe size from 20 to 50 in half steps ("42", "42.5"), or a bag size (`BagSize`).
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_items'

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
      table.string('item_kind', 10).notNullable()
      table.string('brand', 60).nullable()
      table.string('type', 80).notNullable()
      table.string('size', 4).notNullable()
      table.timestamp('created_at').notNullable()

      table.index(['order_id'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
