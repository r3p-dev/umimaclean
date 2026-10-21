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
