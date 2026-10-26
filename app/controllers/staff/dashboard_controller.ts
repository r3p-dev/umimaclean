import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import TaskService, { type TripKind } from '#services/task_service'
import TaskTransformer from '#transformers/task_transformer'

@inject()
export default class DashboardController {
  constructor(protected tasks: TaskService) {}

  async home({ inertia }: HttpContext) {
    let next = null
    for (const kind of ['pickup', 'delivery'] as TripKind[]) {
      const { active, queue, slots } = await this.tasks.tripBoard(kind)
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
