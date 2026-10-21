import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_events'

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
      table.string('status').notNullable()
      table
        .integer('actor_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('note', 300).nullable()
      table.timestamp('created_at').notNullable()
      table.index(['order_id', 'id'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
