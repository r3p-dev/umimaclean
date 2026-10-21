import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  override async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('staff_type').nullable()
      table.string('shift').nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('last_seen_at').nullable()
    })
  }

  override async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('staff_type', 'shift', 'is_active', 'last_seen_at')
    })
  }
}
