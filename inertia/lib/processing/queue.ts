import { urlFor } from '~/client'
import { formatRupiah } from '~/lib/shared/format'
import { inspectionStarted, inspectionState, inspectionSummary } from '~/lib/processing/inspection'
import { AWAITING_QRIS, inspectionOrders } from '~/lib/processing/orders'
import { washOrders, washState } from '~/lib/processing/washing'
import type { TaskSource } from '~/lib/tasks/queue'
import type { Workday } from '~/lib/staff/workday'

export type ProcessAction = 'continue' | 'inspect' | 'collect' | 'open'

export type ProcessRow = {
  number: string
  name: string
  source: TaskSource
  items: string
  meta: string
  action: ProcessAction
  href: string
}

export type ProcessGroupKey = 'periksa' | 'cuci'

export const PROCESS_GROUPS: Record<ProcessGroupKey, { title: string; hint: string }> = {
  periksa: { title: 'Periksa Barang', hint: 'Periksa kondisi, tentukan layanan & harga' },
  cuci: { title: 'Dalam Pencucian', hint: 'Foto hasil cuci → otomatis masuk Antar' },
}

export function processQueue(day: Workday) {
  const periksa: ProcessRow[] = []
  const waiting = [...AWAITING_QRIS]

  for (const order of inspectionOrders(day)) {
    const state = inspectionState(day, order)
    const summary = inspectionSummary(order, state)
    const base = {
      number: order.number,
      name: order.customer,
      source: order.source,
      items: order.estimate,
    }
    if (summary.saved) {
      if (order.source === 'online') {
        waiting.push(order.customer)
      } else if (!day.payments[order.number]) {
        periksa.push({
          ...base,
          meta: `Tersimpan · total ${formatRupiah(summary.total)} · bayar di kasir`,
          action: 'collect',
          href: urlFor('staff.store_payment', { number: order.number }),
        })
      }
      continue
    }
    const started = inspectionStarted(day, order)
    periksa.push({
      ...base,
      meta: started
        ? `Sedang diperiksa · ${summary.filled} dari ${summary.items.length} barang sudah diberi layanan`
        : order.queueMeta,
      action: started ? 'continue' : 'inspect',
      href: urlFor('staff.inspection', { number: order.number }),
    })
  }

  const cuci: ProcessRow[] = washOrders(day)
    .filter((order) => !washState(day, order.number).doneAt)
    .map((order) => ({
      number: order.number,
      name: order.customer,
      source: order.source,
      items: itemsText(order.items.map((item) => item.category)),
      meta: order.queueMeta,
      action: 'open',
      href: urlFor('staff.washing', { number: order.number }),
    }))

  return {
    periksa,
    cuci,
    waiting,
    total: periksa.length + cuci.length,
    waitText: `${waiting.length} pesanan online menunggu pembayaran QRIS (${waiting.join(', ')}). Bukan tugas staf: sistem mengirim pengingat otomatis, dan pesanan masuk Dalam Pencucian setelah lunas.`,
  }
}

function itemsText(categories: string[]) {
  const counts = new Map<string, number>()
  for (const category of categories) counts.set(category, (counts.get(category) ?? 0) + 1)
  return Array.from(counts, ([category, count]) => `${category} ×${count}`).join(', ')
}
