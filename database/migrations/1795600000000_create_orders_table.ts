/*
 * orders: one order a customer places (CUST-6). The number shown everywhere is the id, zero-padded
 * (`UMC-00042`, ORD-1, `Order.number()`).
 *
 * - user_id: the customer who placed it. Accounts are deactivated, never deleted, so RESTRICT.
 * - status: an `OrderStatus` (ORD-2), written only by `OrderService.transitionOrder` (ORD-3).
 * - pickup_date: the pickup day in Asia/Jakarta (SLOT-1).
 * - pickup_slot_id: the slot whose capacity this order takes (SLOT-3). An order keeps a copy of the
 *   slot's times in pickup_starts_at and pickup_ends_at, so a slot changed or deleted later never
 *   changes it; a slot can only be deleted once it holds no pending pickups (M5a decision 1), and
 *   then the link becomes null.
 * - note: the customer's note, up to 300 characters (CUST-5).
 * - request_key: sent with the confirmation form; unique per customer, so a double submit finds the
 *   order the first submit created instead of creating a second one (CUST-6).
 *
 * Index (pickup_slot_id, pickup_date): counting a slot's orders on a date when placing (SLOT-3).
 * Index (user_id): a customer's order list.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.string('status', 30).notNullable()
      table.date('pickup_date').notNullable()
      table
        .integer('pickup_slot_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('pickup_slots')
        .onDelete('SET NULL')
      table.time('pickup_starts_at').notNullable()
      table.time('pickup_ends_at').notNullable()
      table.string('note', 300).nullable()
      table.string('request_key', 64).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['user_id', 'request_key'])
      table.index(['pickup_slot_id', 'pickup_date'])
      table.index(['user_id'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
