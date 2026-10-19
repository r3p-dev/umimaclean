import type { ItemCounts } from '~/lib/order/items'
import type { PickupPoint } from '~/lib/order/draft'
import type { Selection } from '~/lib/processing/catalog'
import { createSharedStore } from '~/lib/shared/shared_store'

export type TaskPhase = 'nav' | 'arrived' | 'shot' | 'done' | 'skipped'

export type ProofShot = { photo: string; stamp: string }

export type TaskProgress = {
  done: number
  phase: TaskPhase
  skips: Record<number, number>
  shot: ProofShot | null
  finishedAt: Record<number, string>
  receivers: Record<number, string>
}

export type InspectionState = {
  selections: Record<string, Selection>
  notes: Record<string, string>
  savedAt: string | null
}

export type WashState = { shot: ProofShot | null; doneAt: string | null }

export type PaymentMethod = 'qris' | 'cash' | 'edc'

export type StorePayment = {
  method: PaymentMethod
  amount: number
  received: number | null
  reference: string | null
  paidAt: string
  stamp: string
}

export type ReturnMethod = 'toko' | 'antar'

export type WalkInOrder = {
  number: string
  customer: string
  customerFull: string
  phone: string
  known: boolean
  items: ItemCounts
  returnMethod: ReturnMethod
  address: string
  point: PickupPoint | null
  createdAt: string
}

export type Workday = {
  jemput: TaskProgress
  antar: TaskProgress
  inspections: Record<string, InspectionState>
  washes: Record<string, WashState>
  payments: Record<string, StorePayment>
  walkIns: WalkInOrder[]
  deliveryInserts: { number: string; at: number }[]
}

function freshProgress(): TaskProgress {
  return { done: 0, phase: 'nav', skips: {}, shot: null, finishedAt: {}, receivers: {} }
}

function freshWorkday(): Workday {
  return {
    jemput: freshProgress(),
    antar: freshProgress(),
    inspections: {},
    washes: {},
    payments: {},
    walkIns: [],
    deliveryInserts: [],
  }
}

export const workday = createSharedStore<Workday>('session', 'umima:staff-workday', freshWorkday)

export function useWorkday() {
  return workday.use()
}

export function resetTasks(kind: 'jemput' | 'antar') {
  workday.set((day) => ({ ...day, [kind]: freshProgress() }))
}

export function resetWorkday() {
  workday.reset()
}

export function clockTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')}`
}
