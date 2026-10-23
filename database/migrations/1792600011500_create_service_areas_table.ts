/*
 * service_areas: the kecamatan of Bandung Raya; pickup and delivery are free inside an active one.
 *
 * - city: kota or kabupaten, e.g. "Kota Bandung" or "Kabupaten Bandung".
 * - name: the kecamatan, with its official BPS spelling.
 * - code: the BPS / COD-AB code (e.g. ID3273230), unique.
 * - boundary: the kecamatan outline as a PostGIS MultiPolygon in WGS 84 (SRID 4326).
 * - is_active: the owner switches it on or off; new areas start off.
 *
 * Data: database/data/service_areas.geojson, the BPS kecamatan boundaries published on HDX
 * (OCHA COD-AB, CC BY-IGO), loaded by service_area_seeder. See README.md, "Data sources".
 *
 * The postgis extension is created here because this is the first table with a geometry column.
 * GIST index on boundary: a pin check asks "which active area contains this point?". The index
 * stores each outline's bounding box, so ST_Contains only compares the point with the few
 * kecamatan whose box holds it instead of every polygon.
 */
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
