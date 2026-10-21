import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  override async up() {
    this.schema.createTable('bills', (table) => {
      table.increments('id')
      table
        .integer('order_id')
        .notNullable()
        .unsigned()
        .unique()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE')
      table.integer('total').notNullable()
      table
        .integer('decided_by')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })

    this.schema.createTable('bill_lines', (table) => {
      table.increments('id')
      table
        .integer('bill_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('bills')
        .onDelete('CASCADE')
      table
        .integer('order_item_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('order_items')
        .onDelete('CASCADE')
      table
        .integer('service_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('services')
        .onDelete('SET NULL')
      table.string('service_type').notNullable()
      table.string('name', 60).notNullable()
      table.integer('price').notNullable()
      table.index(['bill_id'])
    })
  }

  override async down() {
    this.schema.dropTable('bill_lines')
    this.schema.dropTable('bills')
  }
}
