import { scope } from '@adonisjs/lucid/orm'
import { ServiceAreaSchema } from '#database/schema'

export default class ServiceArea extends ServiceAreaSchema {
  static active = scope((query) => {
    query.where('is_active', true)
  })

  static ordered = scope((query) => {
    query.orderBy('city', 'asc').orderBy('name', 'asc')
  })
}
