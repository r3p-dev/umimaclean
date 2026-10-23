/*
 * customer_addresses: a customer's saved pickup and delivery addresses.
 *
 * - label: "Rumah", "Kantor" or a custom name.
 * - recipient_phone: optional other phone for the recipient; the order falls back to the
 *   customer's own phone.
 * - lat, lng: the pin dropped on the map, checked against the service area.
 * - is_primary: the address preselected on the order form.
 * - last_used_at: when the address was last used in an order; deleting the primary
 *   address promotes the most recently used one.
 * - deleted_at: soft delete, so the row behind an old order is never removed.
 *
 * Index (user_id, deleted_at): every read lists one customer's active addresses.
 * Partial unique index on user_id where is_primary and not deleted: the database itself
 * guarantees at most one primary address per customer.
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
      table.string('recipient_phone', 15).nullable()
      table.string('address_text', 300).notNullable()
      table.string('landmark', 120).nullable()
      table.double('lat').notNullable()
      table.double('lng').notNullable()
      table.boolean('is_primary').notNullable().defaultTo(false)
      table.timestamp('last_used_at').nullable()
      table.timestamp('deleted_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.index(['user_id', 'deleted_at'])
    })

    this.schema.raw(`
      CREATE UNIQUE INDEX customer_addresses_user_id_primary_unique
      ON ${this.tableName} (user_id)
      WHERE is_primary AND deleted_at IS NULL
    `)
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
