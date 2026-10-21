import { BaseSchema } from '@adonisjs/lucid/schema'
import { OrderSource, ReturnMethod } from '#enums/order_enum'

export default class extends BaseSchema {
  protected tableName = 'orders'

  override async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('user_id').nullable().alter()
      table.string('source').notNullable().defaultTo(OrderSource.ONLINE).index()
      table.string('return_method').notNullable().defaultTo(ReturnMethod.DELIVERY)
      table.string('customer_name', 80).notNullable().defaultTo('')
      table.string('customer_phone', 15).notNullable().defaultTo('')
      table.date('pickup_date').nullable().alter()
      table.smallint('pickup_slot').nullable().alter()
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
      table.dropColumn('progress')
      table.index(['pickup_date', 'pickup_slot'])
    })
  }

  override async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['pickup_date', 'pickup_slot'])
      table.dropColumns(
        'source',
        'return_method',
        'customer_name',
        'customer_phone',
        'claimed_by',
        'claimed_task',
        'claimed_at',
        'cancel_reason',
        'receiver_name'
      )
      table.jsonb('progress').nullable()
    })
  }
}
