import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

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
      table.string('channel').notNullable()
      table.string('method').notNullable()
      table.string('status').notNullable().index()
      table.integer('amount').notNullable()
      table.integer('cash_received').nullable()
      table.string('reference', 60).nullable()
      table.string('provider_order_id', 60).nullable().unique()
      table.string('provider_transaction_id', 80).nullable()
      table.text('qr_url').nullable()
      table.timestamp('expires_at').nullable()
      table.timestamp('paid_at').nullable().index()
      table
        .integer('recorded_by')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('note', 200).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.index(['order_id', 'status'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
