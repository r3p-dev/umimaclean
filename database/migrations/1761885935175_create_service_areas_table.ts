import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'service_areas'

  override async up() {
    this.schema.raw('CREATE EXTENSION IF NOT EXISTS postgis')

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('city', 60).notNullable()
      table.string('name', 60).notNullable()
      table.string('code', 20).notNullable().unique()
      table.specificType('boundary', 'geometry(MultiPolygon, 4326)').notNullable()
      table.boolean('is_active').notNullable().defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.unique(['city', 'name'])
      table.index(['boundary'], undefined, 'gist')
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
