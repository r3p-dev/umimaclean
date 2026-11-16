/*
 * sessions: database session store for @adonisjs/session (SESSION_DRIVER=database).
 *
 * Sessions live in the database instead of a cookie so pending sign-up data
 * (name, phone, password hash) never reaches the browser.
 * - user_id: session tag for finding and invalidating all sessions of one user (ACC-5).
 * - expires_at: indexed for pruning expired sessions.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sessions'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.text('data').notNullable()
      table.string('user_id').nullable().index()
      table.timestamp('expires_at', { useTz: true }).notNullable().index()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
