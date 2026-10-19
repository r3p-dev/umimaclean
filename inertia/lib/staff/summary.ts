import { processQueue } from '~/lib/processing/queue'
import { taskQueue } from '~/lib/tasks/progress'
import type { Workday } from '~/lib/staff/workday'

export type StaffCounts = { jemput: number; proses: number; antar: number }

export function staffCounts(day: Workday): StaffCounts {
  return {
    jemput: taskQueue(day, 'jemput').left,
    proses: processQueue(day).total,
    antar: taskQueue(day, 'antar').left,
  }
}

export function nextFieldTask(day: Workday) {
  const pickups = taskQueue(day, 'jemput')
  if (pickups.current) return { kind: 'jemput' as const, queue: pickups, task: pickups.current }
  const deliveries = taskQueue(day, 'antar')
  if (deliveries.current)
    return { kind: 'antar' as const, queue: deliveries, task: deliveries.current }
  return null
}
