import { OrderStatus } from '#enums/order_enum'
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
      table.string('public_code', 10).notNullable().unique()
      table.uuid('request_key').notNullable()
      table.string('status').notNullable().defaultTo(OrderStatus.AWAITING_PICKUP).index()
      table.smallint('items_sepatu').notNullable().defaultTo(0)
      table.smallint('items_tas').notNullable().defaultTo(0)
      table.smallint('items_helm').notNullable().defaultTo(0)
      table.string('note', 300).notNullable().defaultTo('')
      table.date('pickup_date').notNullable()
      table.smallint('pickup_slot').notNullable()
      table.jsonb('progress').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.unique(['user_id', 'request_key'])
      table.index(['user_id', 'created_at'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
