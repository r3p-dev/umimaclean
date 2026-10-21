import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  override async up() {
    this.schema.createTable('settings', (table) => {
      table.string('key', 40).primary()
      table.jsonb('value').notNullable()
      table.timestamp('updated_at').notNullable()
    })

    this.schema.createTable('service_districts', (table) => {
      table.increments('id')
      table.string('city', 60).notNullable()
      table.string('district', 60).nullable()
      table.timestamp('created_at').notNullable()
    })
    this.schema.raw(
      `create unique index service_districts_city_district_unique on service_districts (city, coalesce(district, ''))`
    )
  }

  override async down() {
    this.schema.dropTable('service_districts')
    this.schema.dropTable('settings')
  }
}
