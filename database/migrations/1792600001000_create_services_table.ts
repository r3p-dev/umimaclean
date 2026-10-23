/*
 * services: the price list (cleaning services) the owner edits and staff pick from
 * during inspection.
 *
 * - type: 'main' (one per item) or 'addon' (any number per item) (ServiceType enum).
 * - categories: JSON list of item kinds the service applies to (shoe, bag, helmet).
 * - price: in rupiah. Bills copy the price at inspection time, so changing it here never
 *   changes an old bill.
 * - is_starting_price: shown as "mulai dari" on the landing price list.
 * - days: estimated working days, shown to the customer.
 * - is_active: hidden from staff while off, but kept on the list.
 * - position: display order.
 * - deleted_at: soft delete, so bill lines and reports keep pointing at an existing row.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'services'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 60).notNullable()
      table.string('type').notNullable()
      table.jsonb('categories').notNullable()
      table.integer('price').notNullable()
      table.boolean('is_starting_price').notNullable().defaultTo(false)
      table.smallint('days').notNullable().defaultTo(2)
      table.string('description', 200).notNullable().defaultTo('')
      table.boolean('is_active').notNullable().defaultTo(true)
      table.smallint('position').notNullable().defaultTo(0)
      table.timestamp('deleted_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
