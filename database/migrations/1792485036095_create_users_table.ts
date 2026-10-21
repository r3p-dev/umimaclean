import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('role').notNullable().index()
      table.string('name', 80).notNullable()
      table.string('phone', 15).notNullable().unique()
      table.string('password').notNullable()
      table.timestamp('phone_verified_at').nullable()
      table.timestamp('password_changed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
