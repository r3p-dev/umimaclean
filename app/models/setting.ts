import { column } from '@adonisjs/lucid/orm'
import { SettingSchema } from '#database/schema'

export default class Setting extends SettingSchema {
  static override selfAssignPrimaryKey = true

  @column({
    prepare: (value: unknown) => (typeof value === 'string' ? value : JSON.stringify(value)),
    consume: (value: unknown) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare value: Record<string, unknown> | unknown[] | string | number | boolean
}
