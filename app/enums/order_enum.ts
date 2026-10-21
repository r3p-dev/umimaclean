export const OrderStatus = {
  AWAITING_PICKUP: 'awaiting_pickup',
  COURIER_EN_ROUTE: 'courier_en_route',
  PICKED_UP: 'picked_up',
  IN_INSPECTION: 'in_inspection',
  AWAITING_PAYMENT: 'awaiting_payment',
  IN_CLEANING: 'in_cleaning',
  READY_FOR_DELIVERY: 'ready_for_delivery',
  IN_DELIVERY: 'in_delivery',
  READY_FOR_COLLECTION: 'ready_for_collection',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const OrderAddressType = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
} as const

export const OrderStatusLabel = {
  [OrderStatus.AWAITING_PICKUP]: 'Menunggu Penjemputan',
  [OrderStatus.COURIER_EN_ROUTE]: 'Kurir Menuju Lokasi',
  [OrderStatus.PICKED_UP]: 'Barang Kami Terima',
  [OrderStatus.IN_INSPECTION]: 'Sedang Diperiksa',
  [OrderStatus.AWAITING_PAYMENT]: 'Menunggu Pembayaran',
  [OrderStatus.IN_CLEANING]: 'Dalam Pencucian',
  [OrderStatus.READY_FOR_DELIVERY]: 'Siap Diantar',
  [OrderStatus.IN_DELIVERY]: 'Sedang Diantar',
  [OrderStatus.READY_FOR_COLLECTION]: 'Siap Diambil',
  [OrderStatus.COMPLETED]: 'Selesai',
  [OrderStatus.CANCELLED]: 'Dibatalkan',
} as const

export const OrderSource = {
  ONLINE: 'online',
  STORE: 'store',
} as const

export const OrderSourceLabel = {
  [OrderSource.ONLINE]: 'Online',
  [OrderSource.STORE]: 'Offline · Toko',
} as const

export const ReturnMethod = {
  DELIVERY: 'delivery',
  STORE: 'store',
} as const

export const ReturnMethodLabel = {
  [ReturnMethod.DELIVERY]: 'Diantar',
  [ReturnMethod.STORE]: 'Diambil di toko',
} as const

export const OrderTask = {
  PICKUP: 'pickup',
  INSPECTION: 'inspection',
  DELIVERY: 'delivery',
} as const

export const OrderTaskLabel = {
  [OrderTask.PICKUP]: 'Jemput',
  [OrderTask.INSPECTION]: 'Periksa',
  [OrderTask.DELIVERY]: 'Antar',
} as const

export const ItemKind = {
  SHOE: 'shoe',
  BAG: 'bag',
  HELMET: 'helmet',
} as const

export const ItemKindLabel = {
  [ItemKind.SHOE]: 'Sepatu',
  [ItemKind.BAG]: 'Tas',
  [ItemKind.HELMET]: 'Helm',
} as const

export const PhotoKind = {
  PICKUP: 'pickup',
  INTAKE: 'intake',
  WASHING: 'washing',
  DELIVERY: 'delivery',
} as const

export const PhotoKindLabel = {
  [PhotoKind.PICKUP]: 'Bukti penjemputan',
  [PhotoKind.INTAKE]: 'Foto barang diterima',
  [PhotoKind.WASHING]: 'Bukti selesai dicuci',
  [PhotoKind.DELIVERY]: 'Bukti pengantaran',
} as const

export const OrderAddressTypeLabel = {
  [OrderAddressType.PICKUP]: 'Penjemputan',
  [OrderAddressType.DELIVERY]: 'Pengantaran',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]
export type OrderAddressType = (typeof OrderAddressType)[keyof typeof OrderAddressType]
export type OrderSource = (typeof OrderSource)[keyof typeof OrderSource]
export type ReturnMethod = (typeof ReturnMethod)[keyof typeof ReturnMethod]
export type OrderTask = (typeof OrderTask)[keyof typeof OrderTask]
export type ItemKind = (typeof ItemKind)[keyof typeof ItemKind]
export type PhotoKind = (typeof PhotoKind)[keyof typeof PhotoKind]

export const ORDER_STATUS_SEQUENCE: readonly OrderStatus[] = Object.values(OrderStatus)

export const FINISHED_STATUSES: readonly OrderStatus[] = [
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
]

export function orderStatusIndex(status: OrderStatus) {
  return ORDER_STATUS_SEQUENCE.indexOf(status)
}

export type OrderTone = 'jemput' | 'periksa' | 'bayar' | 'cuci' | 'antar' | 'selesai' | 'batal'

export const OrderStatusTone: Record<OrderStatus, OrderTone> = {
  [OrderStatus.AWAITING_PICKUP]: 'jemput',
  [OrderStatus.COURIER_EN_ROUTE]: 'jemput',
  [OrderStatus.PICKED_UP]: 'periksa',
  [OrderStatus.IN_INSPECTION]: 'periksa',
  [OrderStatus.AWAITING_PAYMENT]: 'bayar',
  [OrderStatus.IN_CLEANING]: 'cuci',
  [OrderStatus.READY_FOR_DELIVERY]: 'antar',
  [OrderStatus.IN_DELIVERY]: 'antar',
  [OrderStatus.READY_FOR_COLLECTION]: 'antar',
  [OrderStatus.COMPLETED]: 'selesai',
  [OrderStatus.CANCELLED]: 'batal',
}
