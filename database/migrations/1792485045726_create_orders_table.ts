/*
 * orders: one row per order, placed online by a customer or entered at the store (walk-in).
 *
 * - user_id: the customer's account; null for a walk-in customer without one. RESTRICT so
 *   a customer with orders cannot be deleted.
 * - public_code: the order id shown to customers and used in URLs (UMC- + 6 characters).
 * - request_key: random key sent by the order form; unique per user so a double submit
 *   creates one order, not two.
 * - status: current step of the workflow (OrderStatus enum); every change also appends a
 *   row to order_events.
 * - source: 'online' or 'store' (walk-in).
 * - return_method: 'delivery' (courier brings it back) or 'store' (customer collects it).
 * - customer_name, customer_phone: who to contact. Copied from the account for online
 *   orders and typed by staff for walk-ins, so every reader uses the same two columns.
 * - items_sepatu, items_tas, items_helm: the customer's own count at order time; the real
 *   items are listed in order_items during inspection.
 * - pickup_date, pickup_slot: requested pickup day and slot index; null for walk-ins.
 * - claimed_by, claimed_task, claimed_at: the staff member currently holding a task on
 *   this order (pickup, delivery or inspection) and since when; a claim expires after
 *   3 hours.
 * - cancel_reason: shown to the customer and the owner on a cancelled order.
 * - receiver_name: who accepted the delivery.
 *
 * Indexes: status (staff queues), source (owner filters), (user_id, created_at) (a
 * customer's order history), (pickup_date, pickup_slot) (slot capacity count).
 */
import { BaseSchema } from '@adonisjs/lucid/schema'
import { OrderSource, OrderStatus, ReturnMethod } from '#enums/order_enum'

export default class extends BaseSchema {
  protected tableName = 'orders'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.string('public_code', 10).notNullable().unique()
      table.uuid('request_key').notNullable()
      table.string('status').notNullable().defaultTo(OrderStatus.AWAITING_PICKUP).index()
      table.string('source').notNullable().defaultTo(OrderSource.ONLINE).index()
      table.string('return_method').notNullable().defaultTo(ReturnMethod.DELIVERY)
      table.string('customer_name', 80).notNullable().defaultTo('')
      table.string('customer_phone', 15).notNullable().defaultTo('')
      table.smallint('items_sepatu').notNullable().defaultTo(0)
      table.smallint('items_tas').notNullable().defaultTo(0)
      table.smallint('items_helm').notNullable().defaultTo(0)
      table.string('note', 300).notNullable().defaultTo('')
      table.date('pickup_date').nullable()
      table.smallint('pickup_slot').nullable()
      table
        .integer('claimed_by')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('claimed_task').nullable()
      table.timestamp('claimed_at').nullable()
      table.string('cancel_reason', 200).nullable()
      table.string('receiver_name', 80).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.unique(['user_id', 'request_key'])
      table.index(['user_id', 'created_at'])
      table.index(['pickup_date', 'pickup_slot'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
