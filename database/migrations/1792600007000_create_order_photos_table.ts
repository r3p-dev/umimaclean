/*
 * order_photos: proof photos taken by staff (pickup, intake, washing, delivery).
 *
 * The image file lives on disk under PROOF_STORAGE_PATH; this row only points at it.
 * - kind: which step the photo proves (PhotoKind enum).
 * - path: file path relative to the storage folder; set to null when the file is pruned.
 * - taken_by: the staff member who took it.
 * - pruned_at: when `node ace proofs:prune` deleted the file (after 90 days); the row
 *   stays so the timeline still shows a photo was taken.
 *
 * Index (order_id, kind): photos are read per order and per step.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_photos'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('order_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE')
      table.string('kind').notNullable()
      table.string('path', 200).nullable()
      table
        .integer('taken_by')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('pruned_at').nullable()
      table.timestamp('created_at').notNullable()
      table.index(['order_id', 'kind'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
