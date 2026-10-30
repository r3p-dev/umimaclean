import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import OrderPolicy from '#policies/order_policy'
import TaskService from '#services/task_service'
import { findRouteValidator } from '#validators/staff/task'

@inject()
export default class RoutesController {
  constructor(protected tasks: TaskService) {}

  async show({ bouncer, request }: HttpContext) {
    await bouncer.with(OrderPolicy).authorize('work')
    const { fromLat, fromLng, toLat, toLng } = await request.validateUsing(findRouteValidator)
    return this.tasks.findRoute({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng })
  }
}
