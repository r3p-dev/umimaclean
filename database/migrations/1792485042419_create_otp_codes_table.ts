import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'otp_codes'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('phone', 15).notNullable()
      table.string('purpose').notNullable()
      table.string('code_hash', 64).notNullable()
      table.smallint('attempts').notNullable().defaultTo(0)
      table.timestamp('expires_at').notNullable()
      table.timestamp('consumed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.index(['phone', 'purpose', 'created_at'])
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
