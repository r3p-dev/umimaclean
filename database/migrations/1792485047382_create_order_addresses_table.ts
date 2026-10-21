import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_addresses'

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
      table.string('type').notNullable()
      table
        .integer('customer_address_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('customer_addresses')
        .onDelete('SET NULL')
      table.string('label', 30).notNullable()
      table.string('recipient_name', 80).notNullable()
      table.string('recipient_phone', 15).notNullable()
      table.string('address_text', 300).notNullable()
      table.string('landmark', 120).nullable()
      table.double('lat').notNullable()
      table.double('lng').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.unique(['order_id', 'type'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
