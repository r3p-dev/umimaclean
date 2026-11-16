import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'settings'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('key', 40).primary()
      table.jsonb('value').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
