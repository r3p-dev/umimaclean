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
