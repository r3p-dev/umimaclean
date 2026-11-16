/*
 * services: shoe, bag, and helmet cleaning services catalog (SVC-1..SVC-5, OWN-7).
 * - name: descriptive Indonesian service name.
 * - type: main (one per item) or addon (optional extras).
 * - item_kinds: JSON array of ItemKind values ('shoe', 'bag', 'helmet').
 * - price: service price in whole rupiah (SVC-1).
 * - is_starting_from: true if service price is a baseline ("mulai dari") that staff may raise during inspection (SVC-1).
 * - estimated_days: turnaround time in business days (0 for same-day add-ons).
 * - description: short Indonesian customer-facing explanation.
 * - is_active: flag indicating visibility to staff and customers; inactive services stay on owner list (SVC-2).
 * - display_order: ordering index for presentation on public landing and management tables.
 * - deleted_at: timestamptz for soft deletes; deleted services remain referenced by past bills (SVC-2).
 * - created_at & updated_at: audit timestamptz tracking.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'services'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name', 100).notNullable()
      table.string('type', 20).notNullable()
      table.json('item_kinds').notNullable()
      table.integer('price').notNullable()
      table.boolean('is_starting_from').notNullable().defaultTo(false)
      table.integer('estimated_days').notNullable().defaultTo(0)
      table.text('description').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.integer('display_order').notNullable().defaultTo(0)
      table.timestamp('deleted_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['type'])
      table.index(['is_active'])
      table.index(['deleted_at'])
      table.index(['display_order'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
