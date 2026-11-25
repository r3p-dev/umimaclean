/*
 * order_addresses: the pickup and the delivery address of an order, copied from the customer's
 * saved addresses when the order is placed (CUST-4). Editing or deleting a saved address later never
 * changes these rows. Both rows exist even when delivery goes to the pickup address.
 *
 * - kind: `pickup` or `delivery` (`OrderAddressKind`); unique per order.
 * - The other columns copy `customer_addresses` (D109): the recipient, the typed text and details,
 *   the pin and the area read at the pin.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_addresses'

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
      table.string('kind', 10).notNullable()
      table.string('label', 30).notNullable()
      table.string('recipient_name', 80).notNullable()
      table.string('recipient_phone', 15).notNullable()
      table.string('address_text', 300).notNullable()
      table.string('details', 160).nullable()
      table.double('lat').notNullable()
      table.double('lng').notNullable()
      table.string('street', 160).nullable()
      table.string('kelurahan', 80).nullable()
      table.string('kecamatan', 60).notNullable()
      table.string('city', 60).notNullable()
      table.timestamp('created_at').notNullable()

      table.unique(['order_id', 'kind'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
