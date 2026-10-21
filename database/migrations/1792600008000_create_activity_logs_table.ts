import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activity_logs'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('actor_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table
        .integer('order_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE')
      table.string('action').notNullable()
      table.string('detail', 300).notNullable().defaultTo('')
      table.boolean('is_sensitive').notNullable().defaultTo(false)
      table.timestamp('created_at').notNullable().index()
      table.index(['actor_id', 'created_at'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
