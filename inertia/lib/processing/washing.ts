import { selectionLines } from '~/lib/processing/catalog'
import { inspectionState, inspectionSummary } from '~/lib/processing/inspection'
import { WASH_ORDERS, inspectionOrders, type WashOrder } from '~/lib/processing/orders'
import { METHOD_LABEL } from '~/lib/store/payment'
import { clockTime, workday, type ProofShot, type Workday } from '~/lib/staff/workday'

export function paidStoreOrders(day: Workday): WashOrder[] {
  return inspectionOrders(day)
    .filter((order) => order.source === 'toko' && day.payments[order.number])
    .map((order) => {
      const payment = day.payments[order.number]
      const summary = inspectionSummary(order, inspectionState(day, order))
      return {
        number: order.number,
        customer: order.customer,
        source: 'toko',
        queueMeta: `Lunas · ${METHOD_LABEL[payment.method]} · dicuci sejak ${payment.paidAt}`,
        statusSub: `${order.customer} · Lunas ${METHOD_LABEL[payment.method].toLowerCase()} di toko · dicuci sejak ${payment.paidAt}`,
        items: summary.items.map((item) => ({
          name: item.title,
          category: item.category,
          services: selectionLines(item.category, item.selection).map((line) => line.name),
        })),
        returnMethod: order.returnMethod,
        delivery: order.delivery,
      }
    })
}

export function washOrders(day: Workday) {
  return [...WASH_ORDERS, ...paidStoreOrders(day)]
}

export function findWashOrder(day: Workday, number: string) {
  return washOrders(day).find((order) => order.number === number) ?? null
}

export function washState(day: Workday, number: string) {
  return day.washes[number] ?? { shot: null, doneAt: null }
}

export function setWashShot(number: string, shot: ProofShot | null) {
  workday.set((day) => ({
    ...day,
    washes: { ...day.washes, [number]: { ...washState(day, number), shot } },
  }))
}

export function completeWash(order: WashOrder) {
  workday.set((day) => {
    const state = washState(day, order.number)
    if (!state.shot || state.doneAt) return day
    const inserts =
      order.returnMethod === 'antar' && order.delivery
        ? [
            ...day.deliveryInserts.filter((item) => item.number !== order.number),
            { number: order.number, at: Math.max(day.antar.done, 2) },
          ]
        : day.deliveryInserts
    return {
      ...day,
      washes: { ...day.washes, [order.number]: { ...state, doneAt: clockTime() } },
      deliveryInserts: inserts,
    }
  })
}

export function resetWash(number: string) {
  workday.set((day) => {
    const washes = { ...day.washes }
    delete washes[number]
    const position = day.deliveryInserts.find((item) => item.number === number)
    const delivered = position ? day.antar.done > position.at : false
    return {
      ...day,
      washes,
      deliveryInserts: delivered
        ? day.deliveryInserts
        : day.deliveryInserts.filter((item) => item.number !== number),
    }
  })
}
