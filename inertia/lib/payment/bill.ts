import { formatRupiah } from '~/lib/shared/format'

export type BillLine = {
  name: string
  kind: 'Sepatu' | 'Tas' | 'Helm'
  services: [string, number][]
}

export type Bill = {
  lines: BillLine[]
  decidedAt: string
  sentAt: string
}

export function billTotal(bill: Bill) {
  return bill.lines.reduce(
    (sum, line) => sum + line.services.reduce((acc, [, price]) => acc + price, 0),
    0
  )
}

export function billRows(bill: Bill) {
  return bill.lines.map((line) => ({
    name: line.name,
    meta: `${line.kind} · ${line.services.length} layanan`,
    services: line.services.map(([name, price]) => ({ name, price: formatRupiah(price) })),
    subtotal: formatRupiah(line.services.reduce((sum, [, price]) => sum + price, 0)),
  }))
}
