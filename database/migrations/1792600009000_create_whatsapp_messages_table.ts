/*
 * whatsapp_messages: a log of every WhatsApp message sent through Fonnte.
 *
 * - target: the number it was sent to.
 * - purpose: which message it was (MessagePurpose enum).
 * - status: sent, failed or logged (no Fonnte token outside production).
 *
 * Index (user_id, purpose, created_at): the owner's customer reminders check whether a
 * customer was already reminded in the last 7 days. Index on order_id: messages per order.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'whatsapp_messages'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('order_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('target', 15).notNullable()
      table.string('purpose').notNullable()
      table.string('status').notNullable()
      table.timestamp('created_at').notNullable()
      table.index(['user_id', 'purpose', 'created_at'])
      table.index(['order_id'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
