import type { HttpContext } from '@adonisjs/core/http'
import { PHOTO_RETENTION_DAYS } from '#models/order_photo'
import Setting from '#models/setting'

export default class LegalController {
  async terms({ inertia }: HttpContext) {
    return inertia.render('legal/terms', { store: await Setting.get('store') })
  }

  async privacy({ inertia }: HttpContext) {
    return inertia.render('legal/privacy', {
      store: await Setting.get('store'),
      photoDays: PHOTO_RETENTION_DAYS,
    })
  }
}
