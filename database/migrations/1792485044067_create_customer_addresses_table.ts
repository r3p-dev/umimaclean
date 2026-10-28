/*
 * customer_addresses: a customer's saved pickup and delivery addresses.
 *
 * At most 3 per customer (checked in AddressService). Rows are deleted for real: every
 * order keeps its own copy in order_addresses, so nothing points back here.
 * - label: "Rumah", "Kantor" or a custom name.
 * - recipient_phone: who the courier calls at this address, normalized like users.phone
 *   (62…); prefilled with the account phone but may belong to someone else.
 * - lat, lng: the pin dropped on the map, checked against the service area.
 * - is_primary: the address preselected on the order form; deleting it promotes the
 *   newest remaining address.
 *
 * Index on user_id: every read lists one customer's addresses.
 * Partial unique index on user_id where is_primary: the database itself guarantees at
 * most one primary address per customer.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'customer_addresses'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('label', 30).notNullable()
      table.string('recipient_name', 80).notNullable()
      table.string('recipient_phone', 15).notNullable()
      table.string('address_text', 300).notNullable()
      table.string('landmark', 120).nullable()
      table.double('lat').notNullable()
      table.double('lng').notNullable()
      table.boolean('is_primary').notNullable().defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.index(['user_id'])
    })

    this.schema.raw(`
      CREATE UNIQUE INDEX customer_addresses_user_id_primary_unique
      ON ${this.tableName} (user_id)
      WHERE is_primary
    `)
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
