// Order statuses, their labels and stages (ORD-2) and the allowed transitions (ORD-3).
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

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const OrderStatusLabel: Record<OrderStatus, string> = {
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
}

export const OrderStage = {
  JEMPUT: 'jemput',
  PERIKSA: 'periksa',
  BAYAR: 'bayar',
  CUCI: 'cuci',
  ANTAR: 'antar',
  SELESAI: 'selesai',
  BATAL: 'batal',
} as const

export type OrderStage = (typeof OrderStage)[keyof typeof OrderStage]

export const OrderStageOf: Record<OrderStatus, OrderStage> = {
  [OrderStatus.AWAITING_PICKUP]: OrderStage.JEMPUT,
  [OrderStatus.COURIER_EN_ROUTE]: OrderStage.JEMPUT,
  [OrderStatus.PICKED_UP]: OrderStage.PERIKSA,
  [OrderStatus.IN_INSPECTION]: OrderStage.PERIKSA,
  [OrderStatus.AWAITING_PAYMENT]: OrderStage.BAYAR,
  [OrderStatus.IN_CLEANING]: OrderStage.CUCI,
  [OrderStatus.READY_FOR_DELIVERY]: OrderStage.ANTAR,
  [OrderStatus.IN_DELIVERY]: OrderStage.ANTAR,
  [OrderStatus.READY_FOR_COLLECTION]: OrderStage.ANTAR,
  [OrderStatus.COMPLETED]: OrderStage.SELESAI,
  [OrderStatus.CANCELLED]: OrderStage.BATAL,
}

// ORD-3, nothing else is possible. Who may make a transition (the owner alone cancels after
// `awaiting_pickup`) is checked by the service method that makes it (docs/ARCHITECTURE.md §5.1).
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [OrderStatus.AWAITING_PICKUP]: [OrderStatus.COURIER_EN_ROUTE, OrderStatus.CANCELLED],
  [OrderStatus.COURIER_EN_ROUTE]: [
    OrderStatus.PICKED_UP,
    OrderStatus.AWAITING_PICKUP,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PICKED_UP]: [OrderStatus.IN_INSPECTION, OrderStatus.CANCELLED],
  [OrderStatus.IN_INSPECTION]: [OrderStatus.AWAITING_PAYMENT, OrderStatus.CANCELLED],
  [OrderStatus.AWAITING_PAYMENT]: [OrderStatus.IN_CLEANING, OrderStatus.CANCELLED],
  [OrderStatus.IN_CLEANING]: [
    OrderStatus.READY_FOR_DELIVERY,
    OrderStatus.READY_FOR_COLLECTION,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.READY_FOR_DELIVERY]: [OrderStatus.IN_DELIVERY, OrderStatus.CANCELLED],
  [OrderStatus.IN_DELIVERY]: [
    OrderStatus.COMPLETED,
    OrderStatus.READY_FOR_DELIVERY,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.READY_FOR_COLLECTION]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
}

// Orders whose pickup has not happened yet: they hold their slot's times (M5a decision 1).
export const PICKUP_PENDING_STATUSES: readonly OrderStatus[] = [
  OrderStatus.AWAITING_PICKUP,
  OrderStatus.COURIER_EN_ROUTE,
]
