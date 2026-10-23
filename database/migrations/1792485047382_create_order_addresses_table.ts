/*
 * order_addresses: the pickup and delivery address of an order, copied at order time.
 *
 * A copy, not a link: the customer can edit or delete a saved address later, and the
 * order must still show where it was picked up and where it goes. Walk-in deliveries
 * have no saved address at all.
 * - type: 'pickup' or 'delivery' (OrderAddressType enum).
 * - customer_address_id: the saved address it was copied from; SET NULL when that
 *   address is removed.
 * - recipient_phone: always filled, falling back to the customer's phone.
 *
 * Unique (order_id, type): an order has at most one pickup and one delivery address.
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
      table.string('type').notNullable()
      table
        .integer('customer_address_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('customer_addresses')
        .onDelete('SET NULL')
      table.string('label', 30).notNullable()
      table.string('recipient_name', 80).notNullable()
      table.string('recipient_phone', 15).notNullable()
      table.string('address_text', 300).notNullable()
      table.string('landmark', 120).nullable()
      table.double('lat').notNullable()
      table.double('lng').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.unique(['order_id', 'type'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
