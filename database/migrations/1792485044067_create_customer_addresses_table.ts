import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'customer_addresses'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('label', 30).notNullable()
      table.string('recipient_name', 80).notNullable()
      table.string('recipient_phone', 15).nullable()
      table.string('address_text', 300).notNullable()
      table.string('landmark', 120).nullable()
      table.double('lat').notNullable()
      table.double('lng').notNullable()
      table.boolean('is_primary').notNullable().defaultTo(false)
      table.timestamp('last_used_at').nullable()
      table.timestamp('deleted_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.index(['user_id', 'deleted_at'])
    })

    this.schema.raw(`
      CREATE UNIQUE INDEX customer_addresses_user_id_primary_unique
      ON ${this.tableName} (user_id)
      WHERE is_primary AND deleted_at IS NULL
    `)
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
