/*
 * customer_addresses: a customer's saved pickup and delivery addresses (CUST-2, CUST-3).
 *
 * At most 3 per customer, checked in AddressService while the customer's row is locked.
 * - label: "Rumah", "Kantor" or a name the customer types.
 * - recipient_phone: who staff call at this address, normalized to 62… like users.phone;
 *   prefilled with the account phone but may belong to someone else.
 * - lat, lng: the map pin, checked against the active service areas when saved (AREA-4). A pin
 *   whose district is turned off later stays saved and is shown as outside the area (D82).
 * - is_primary: the address chosen first when ordering; deleting it promotes the newest remaining.
 *
 * Index on user_id: every read lists one customer's addresses.
 * Partial unique index on user_id where is_primary: the database allows at most one primary
 * address per customer, whatever the application does.
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

    this.schema.raw(
      `CREATE UNIQUE INDEX customer_addresses_one_primary_per_user ON ${this.tableName} (user_id) WHERE is_primary`
    )
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
