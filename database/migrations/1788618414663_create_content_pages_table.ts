import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * One row per public page, so the sitemap's `lastmod` can be honest.
 *
 * The alternative — stamping `new Date()` at request time — tells every
 * crawler that every page changed on every crawl, which is a lie they learn to
 * ignore. Here a row's `updated_at` moves only when a content hash actually
 * changes, so `lastmod` means what it says.
 */
export default class extends BaseSchema {
  protected tableName = 'content_pages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('path').notNullable().unique()

      /**
       * sha256 of the content that renders this page. Comparing hashes is what
       * lets the sync leave `updated_at` alone when nothing actually changed.
       */
      table.string('content_hash', 64).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
