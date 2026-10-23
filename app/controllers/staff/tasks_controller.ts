import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import OrderPolicy from '#policies/order_policy'
import Setting from '#models/setting'
import TaskService, { SKIP_REASONS } from '#services/task_service'
import TaskTransformer from '#transformers/task_transformer'
import { formatClock } from '#transformers/order_transformer'
import { completeTaskValidator, skipTaskValidator } from '#validators/staff/task'
import { fieldError } from '#validators/shared/field_error'

const KINDS = { jemput: 'pickup', antar: 'delivery' } as const

type KindParameter = keyof typeof KINDS

const RESULT_KEY = 'task_result'

type TaskResult = { kind: KindParameter; id: number; isSkipped: boolean; reason: string | null }

@inject()
export default class TasksController {
  constructor(protected tasks: TaskService) {}

  async pickups(ctx: HttpContext) {
    return this.#queue(ctx, 'jemput')
  }

  async deliveries(ctx: HttpContext) {
    return this.#queue(ctx, 'antar')
  }

  async pickupTask(ctx: HttpContext) {
    return this.#active(ctx, 'jemput')
  }

  async deliveryTask(ctx: HttpContext) {
    return this.#active(ctx, 'antar')
  }

  async start(ctx: HttpContext) {
    const { auth, response } = ctx
    const kind = await this.#authorize(ctx)
    await this.tasks.startTrip(auth.getUserOrFail(), Number(ctx.params.id), KINDS[kind])
    return response.redirect().toRoute(this.#taskRoute(kind))
  }

  async arrive(ctx: HttpContext) {
    const { auth, response } = ctx
    const kind = await this.#authorize(ctx)
    await this.tasks.arrive(auth.getUserOrFail(), Number(ctx.params.id), KINDS[kind])
    return response.redirect().toRoute(this.#taskRoute(kind))
  }

  async complete(ctx: HttpContext) {
    const { auth, request, response, session } = ctx
    const kind = await this.#authorize(ctx)
    const payload = await request.validateUsing(completeTaskValidator)
    if (kind === 'antar' && !payload.receiver) {
      throw fieldError('receiver', 'Isi nama penerima barang.', 'receiver.required')
    }
    const id = Number(ctx.params.id)
    await this.tasks.completeTrip(
      auth.getUserOrFail(),
      id,
      KINDS[kind],
      payload.photo,
      payload.receiver
    )
    session.flash(RESULT_KEY, { kind, id, isSkipped: false, reason: null } satisfies TaskResult)
    return response.redirect().toRoute(this.#taskRoute(kind))
  }

  async skip(ctx: HttpContext) {
    const { auth, request, response, session } = ctx
    const kind = await this.#authorize(ctx)
    const payload = await request.validateUsing(skipTaskValidator)
    const id = Number(ctx.params.id)
    const reason = SKIP_REASONS[payload.reason]
    await this.tasks.skipTrip(auth.getUserOrFail(), id, KINDS[kind], reason, payload.note)
    session.flash(RESULT_KEY, { kind, id, isSkipped: true, reason } satisfies TaskResult)
    return response.redirect().toRoute(this.#taskRoute(kind))
  }

  async #queue({ auth, bouncer, inertia }: HttpContext, kind: KindParameter) {
    await bouncer.with(OrderPolicy).authorize('work')
    const user = auth.getUserOrFail()
    const trip = KINDS[kind]
    const slots = await Setting.get('pickup_slots')
    const [active, queue, handled] = await Promise.all([
      this.tasks.activeTrip(trip),
      this.tasks.queue(trip),
      this.tasks.handledToday(user, trip),
    ])
    const tasks = [...(active ? [active] : []), ...queue]

    return inertia.render('staff/tasks/queue', {
      kind,
      tasks: tasks.map((order) => new TaskTransformer(order, trip, slots).toObject()),
      hasActive: !!active,
      handled: handled.map((entry) => ({
        task: new TaskTransformer(entry.order, trip, slots).toObject(),
        wasSkipped: entry.action.endsWith('skipped'),
        reason: entry.action.endsWith('skipped') ? entry.detail : null,
        time: entry.action.endsWith('skipped')
          ? 'Dilewati'
          : `Selesai ${formatClock(entry.createdAt)}`,
      })),
    })
  }

  async #active({ auth, bouncer, inertia, session }: HttpContext, kind: KindParameter) {
    await bouncer.with(OrderPolicy).authorize('work')
    const user = auth.getUserOrFail()
    const trip = KINDS[kind]
    const slots = await Setting.get('pickup_slots')
    const [active, queue] = await Promise.all([this.tasks.activeTrip(trip), this.tasks.queue(trip)])
    const result = session.flashMessages.get(RESULT_KEY) as TaskResult | undefined
    const handledToday = result ? await this.tasks.handledToday(user, trip) : []
    const handled = handledToday.find((entry) => entry.order.id === result?.id)

    return inertia.render('staff/tasks/active', {
      kind,
      task: active ? new TaskTransformer(active, trip, slots).toObject() : null,
      phase: active && (await this.tasks.hasArrived(active)) ? 'arrived' : 'nav',
      next: queue[0] ? new TaskTransformer(queue[0], trip, slots).toObject() : null,
      skipReasons: [...SKIP_REASONS],
      result:
        result && handled
          ? {
              ...result,
              task: new TaskTransformer(handled.order, trip, slots).toObject(),
              receiver: handled.order.receiverName,
              time: formatClock(handled.createdAt),
            }
          : null,
    })
  }

  async #authorize({ bouncer, params }: HttpContext): Promise<KindParameter> {
    await bouncer.with(OrderPolicy).authorize('work')
    return params.kind === 'antar' ? 'antar' : 'jemput'
  }

  #taskRoute(kind: KindParameter) {
    return kind === 'jemput' ? 'staff.pickup_task' : 'staff.delivery_task'
  }
}
