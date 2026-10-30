import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import TaskService, { type TripKind } from '#services/task_service'
import TaskTransformer from '#transformers/task_transformer'
import { courierPosition } from '#validators/staff/task'

@inject()
export default class DashboardController {
  constructor(protected tasks: TaskService) {}

  async home({ auth, inertia, request }: HttpContext) {
    const courier = {
      id: auth.getUserOrFail().id,
      position: await courierPosition(request.header('x-courier-position')),
    }
    let next = null
    for (const kind of ['pickup', 'delivery'] as TripKind[]) {
      const { active, queue, slots } = await this.tasks.tripBoard(kind, courier)
      const first = active ?? queue[0]
      if (first) {
        const tasks = active ? [active] : queue
        const { legs, start } = await this.tasks.findTripLegs(tasks, kind, courier.position)
        next = {
          kind: kind === 'pickup' ? ('jemput' as const) : ('antar' as const),
          isActive: !!active,
          task: new TaskTransformer(first, kind, slots, legs.get(first.id), start).toObject(),
          tasks: tasks.map((order, index) =>
            new TaskTransformer(
              order,
              kind,
              slots,
              legs.get(order.id),
              index ? null : start
            ).toObject()
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
