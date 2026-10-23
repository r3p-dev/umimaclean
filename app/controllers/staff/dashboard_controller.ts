import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Setting from '#models/setting'
import TaskService, { type TripKind } from '#services/task_service'
import TaskTransformer from '#transformers/task_transformer'

@inject()
export default class DashboardController {
  constructor(protected tasks: TaskService) {}

  async home({ inertia }: HttpContext) {
    const slots = await Setting.get('pickup_slots')

    let next = null
    for (const kind of ['pickup', 'delivery'] as TripKind[]) {
      const active = await this.tasks.activeTrip(kind)
      const queue = active ? [] : await this.tasks.queue(kind)
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
