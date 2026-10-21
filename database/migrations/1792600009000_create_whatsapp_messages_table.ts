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
