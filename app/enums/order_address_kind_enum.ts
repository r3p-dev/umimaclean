// Which copy of an address an order holds (CUST-4).
export const OrderAddressKind = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
} as const

export type OrderAddressKind = (typeof OrderAddressKind)[keyof typeof OrderAddressKind]

export const OrderAddressKindLabel: Record<OrderAddressKind, string> = {
  [OrderAddressKind.PICKUP]: 'Penjemputan',
  [OrderAddressKind.DELIVERY]: 'Pengantaran',
}
