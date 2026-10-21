import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import FieldTaskService, { type TripKind } from '#services/order/field_task_service'
import SettingsService from '#services/settings_service'
import TaskTransformer from '#transformers/task_transformer'

@inject()
export default class DashboardController {
  constructor(
    protected trips: FieldTaskService,
    protected settings: SettingsService
  ) {}

  async home({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    const slots = await this.settings.get('pickup_slots')

    let next = null
    for (const kind of ['pickup', 'delivery'] as TripKind[]) {
      const active = await this.trips.active(user, kind)
      const queue = active ? [] : await this.trips.queue(user, kind)
      const first = active ?? queue[0]
      if (first) {
        next = {
          kind: kind === 'pickup' ? ('jemput' as const) : ('antar' as const),
          isActive: !!active,
          task: new TaskTransformer(first, kind, slots).toObject(),
          tasks: (active ? [active] : queue).map((order) =>
            new TaskTransformer(order, kind, slots).toObject()
          ),
        }
        break
      }
    }

    return inertia.render('staff/home', { next })
  }

  async more({ inertia }: HttpContext) {
    return inertia.render('staff/more', {})
  }
}
