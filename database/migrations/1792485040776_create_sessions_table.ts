/*
 * sessions: the database session store (SESSION_DRIVER=database).
 *
 * Sessions live in the database instead of a cookie so the pending sign-up (name, phone,
 * password hash) never reaches the browser.
 * - user_id: the session tag, so "log out other devices" can find and destroy every
 *   session of one user. Indexed for that lookup.
 * - expires_at: indexed so expired sessions can be cleaned up quickly.
 */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sessions'

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.text('data').notNullable()
      table.string('user_id').nullable().index()
      table.timestamp('expires_at').notNullable().index()
    })
  }

  override async down() {
    this.schema.dropTable(this.tableName)
  }
}
