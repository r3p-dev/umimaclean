/*
 * order_items: the actual items of an order, listed by staff during inspection.
 *
 * - kind: shoe, bag or helmet (ItemKind enum).
 * - name: what staff wrote down, e.g. "Nike Air Force 1 putih".
 * - note: condition notes, e.g. stains or damage.
 * - position: 1, 2, 3... the order staff listed them in.
 * - washed_at: set when washing is done.
 *
 * Unique (order_id, position): each item has its own number within the order.
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
      table.string('kind').notNullable()
      table.string('name', 80).notNullable()
      table.string('note', 300).notNullable().defaultTo('')
      table.smallint('position').notNullable()
      table.timestamp('washed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.unique(['order_id', 'position'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
