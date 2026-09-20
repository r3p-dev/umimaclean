import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Order requests placed from the public site, without an account.
 *
 * Ordering happens through the site, not over WhatsApp, so this is the front
 * door. It is deliberately the anonymous path that Phase 5 keeps rather than
 * replaces: when accounts and scheduling arrive, a signed-in order becomes a
 * request with a user attached, not a different table.
 */
export default class extends BaseSchema {
  protected tableName = 'order_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name').notNullable()
      table.string('phone').notNullable()

      /** Validated against the coverage list, never free text. */
      table.string('kecamatan').notNullable()

      /**
       * Bandung's OSM data has no housenumbers, so a written note is the only
       * thing that reliably gets a driver to the door.
       */
      table.text('address_note').notNullable()

      table.string('service_slug').notNullable()
      table.text('notes').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
