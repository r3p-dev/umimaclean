/*
 * operating_costs: business expenses the owner enters (rent, salaries, supplies), used to
 * show profit on the reports page.
 *
 * - category: CostCategory enum.
 * - spent_on: the day of the expense; indexed because reports sum costs per date range.
 * - created_by: the owner who entered it.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'operating_costs'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('category').notNullable()
      table.string('note', 120).notNullable()
      table.integer('amount').notNullable()
      table.date('spent_on').notNullable().index()
      table
        .integer('created_by')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
