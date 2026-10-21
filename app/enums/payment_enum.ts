export const PaymentChannel = {
  ONLINE: 'online',
  COUNTER: 'counter',
} as const

export const PaymentChannelLabel = {
  [PaymentChannel.ONLINE]: 'Online',
  [PaymentChannel.COUNTER]: 'Di toko',
} as const

export const PaymentMethod = {
  QRIS: 'qris',
  CASH: 'cash',
  CARD: 'card',
} as const

export const PaymentMethodLabel = {
  [PaymentMethod.QRIS]: 'QRIS',
  [PaymentMethod.CASH]: 'Tunai',
  [PaymentMethod.CARD]: 'EDC',
} as const

export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
} as const

export const PaymentStatusLabel = {
  [PaymentStatus.PENDING]: 'Menunggu',
  [PaymentStatus.PAID]: 'Lunas',
  [PaymentStatus.EXPIRED]: 'Kedaluwarsa',
  [PaymentStatus.CANCELLED]: 'Dibatalkan',
  [PaymentStatus.FAILED]: 'Gagal',
} as const

export type PaymentChannel = (typeof PaymentChannel)[keyof typeof PaymentChannel]
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]
