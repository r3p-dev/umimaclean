import { WASH_ORDERS, walkInOrder } from '~/lib/processing/orders'
import {
  SKIP_REASONS,
  deliveryQueue,
  pickupQueue,
  type Task,
  type TaskKind,
} from '~/lib/tasks/queue'
import { clockTime, workday, type ProofShot, type Workday } from '~/lib/staff/workday'

export type QueueState = 'current' | 'next' | 'later'

export function tasksFor(day: Workday, kind: TaskKind): Task[] {
  if (kind === 'jemput') return pickupQueue()
  const known = new Map(
    [
      ...WASH_ORDERS.map((order) => order.delivery),
      ...day.walkIns.map((order) => walkInOrder(order).delivery),
    ]
      .filter((seed) => seed !== undefined)
      .map((seed) => [seed.ref, seed])
  )
  const inserts = day.deliveryInserts.flatMap((item) => {
    const seed = known.get(item.number)
    return seed ? [{ at: item.at, tasks: [seed] }] : []
  })
  return deliveryQueue(inserts)
}

export function taskQueue(day: Workday, kind: TaskKind) {
  const tasks = tasksFor(day, kind)
  const progress = day[kind]
  const remaining = tasks.slice(progress.done)
  const skipped = Object.keys(progress.skips).length

  return {
    tasks,
    progress,
    remaining: remaining.map((task, index) => ({
      task,
      number: progress.done + index + 1,
      state: (index === 0 ? 'current' : index === 1 ? 'next' : 'later') as QueueState,
    })),
    left: remaining.length,
    allDone: progress.done >= tasks.length,
    current: tasks[progress.done] ?? null,
    previous: progress.done > 0 ? tasks[progress.done - 1] : null,
    handled: tasks.slice(0, progress.done).map((task, index) => {
      const reason = progress.skips[index]
      return {
        task,
        skipped: reason !== undefined,
        reason: reason !== undefined ? SKIP_REASONS[reason] : null,
        time:
          reason !== undefined
            ? 'Dilewati'
            : `Selesai ${progress.finishedAt[index] ?? task.doneAt}`,
      }
    }),
    subtitle:
      `${remaining.length} tersisa` +
      (kind === 'jemput'
        ? ` · ${remaining.reduce((sum, task) => sum + task.count, 0)} barang`
        : '') +
      (skipped ? ` · ${skipped} dilewati` : ''),
  }
}

function patch(kind: TaskKind, change: (day: Workday) => Partial<Workday[TaskKind]>) {
  workday.set((day) => ({ ...day, [kind]: { ...day[kind], ...change(day) } }))
}

export function arriveAtTask(kind: TaskKind) {
  patch(kind, () => ({ phase: 'arrived' }))
}

export function keepTaskShot(kind: TaskKind, shot: ProofShot | null) {
  patch(kind, () => ({ phase: shot ? 'shot' : 'arrived', shot }))
}

export function completeTask(kind: TaskKind, receiver?: string) {
  patch(kind, (day) => ({
    done: day[kind].done + 1,
    phase: 'done',
    shot: null,
    finishedAt: { ...day[kind].finishedAt, [day[kind].done]: clockTime() },
    receivers: receiver
      ? { ...day[kind].receivers, [day[kind].done]: receiver }
      : day[kind].receivers,
  }))
}

export function skipTask(kind: TaskKind, reason: number) {
  patch(kind, (day) => ({
    done: day[kind].done + 1,
    phase: 'skipped',
    shot: null,
    skips: { ...day[kind].skips, [day[kind].done]: reason },
  }))
}

export function continueTasks(kind: TaskKind) {
  patch(kind, () => ({ phase: 'nav' }))
}
