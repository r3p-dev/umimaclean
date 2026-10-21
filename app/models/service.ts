import { scope } from '@adonisjs/lucid/orm'
import { ServiceSchema } from '#database/schema'

export default class Service extends ServiceSchema {
  static available = scope((query) => {
    query.whereNull('deleted_at')
  })

  static ordered = scope((query) => {
    query.orderBy('type', 'asc').orderBy('position', 'asc').orderBy('id', 'asc')
  })
}
