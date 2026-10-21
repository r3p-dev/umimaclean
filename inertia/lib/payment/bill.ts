import type { Data } from '@generated/data'
import { formatRupiah } from '~/lib/shared/format'

export type Bill = NonNullable<Data.Order['bill']>

export type BillLine = Bill['lines'][number]

export function billTotal(bill: Bill) {
  return bill.total
}

export function lineTotal(line: BillLine) {
  return line.services.reduce((sum, service) => sum + service.price, 0)
}

export function billRows(bill: Bill) {
  return bill.lines.map((line) => ({
    name: line.name,
    meta: `${line.kind} · ${line.services.length} layanan`,
    services: line.services.map((service) => ({
      name: service.name,
      price: formatRupiah(service.price),
    })),
    subtotal: formatRupiah(lineTotal(line)),
  }))
}
