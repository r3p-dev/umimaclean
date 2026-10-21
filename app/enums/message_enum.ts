export const MessageStatus = {
  SENT: 'sent',
  FAILED: 'failed',
  LOGGED: 'logged',
} as const

export const MessagePurpose = {
  NEW_ORDER: 'new_order',
  COURIER_ON_THE_WAY: 'courier_on_the_way',
  PICKED_UP: 'picked_up',
  PICKUP_SKIPPED: 'pickup_skipped',
  BILL_READY: 'bill_ready',
  PAID: 'paid',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERY_SKIPPED: 'delivery_skipped',
  READY_FOR_COLLECTION: 'ready_for_collection',
  RECEIPT: 'receipt',
  ORDER_CANCELLED: 'order_cancelled',
  CUSTOMER_CANCELLED: 'customer_cancelled',
  REMINDER: 'reminder',
  STAFF_PASSWORD: 'staff_password',
} as const

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus]
export type MessagePurpose = (typeof MessagePurpose)[keyof typeof MessagePurpose]
