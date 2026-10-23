/*
 * service_districts: the free pickup and delivery area the owner edits.
 *
 * - city: e.g. "Kota Bandung" or "Kab. Bandung".
 * - district: a kecamatan in that city; null means the whole city is covered.
 *
 * Unique index on (city, coalesce(district, '')): a plain unique constraint treats every
 * null as different, so the coalesce stops "whole city" from being stored twice.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'service_districts'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('city', 60).notNullable()
      table.string('district', 60).nullable()
      table.timestamp('created_at').notNullable()
    })

    this.schema.raw(
      `create unique index service_districts_city_district_unique on ${this.tableName} (city, coalesce(district, ''))`
    )
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
