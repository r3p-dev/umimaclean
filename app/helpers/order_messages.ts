import type { DateTime } from 'luxon'
import { displayTime } from '#helpers/opening_hours'

type ReceivedOrder = {
  number: string
  pickupDate: DateTime
  pickupStartsAt: string
  pickupEndsAt: string
}

// MSG-1.1, the online version (M5a decision 4): "Halo Rina, pesanan UMC-00042 sudah kami terima.
// Penjemputan: Kamis, 27 Nov 2026, 09.00–12.00." The order link joins in M5b.
export function orderReceivedText(customerName: string, order: ReceivedOrder) {
  const day = order.pickupDate.setLocale('id').toFormat('cccc, d LLL yyyy')
  const slot = `${displayTime(order.pickupStartsAt)}–${displayTime(order.pickupEndsAt)}`
  return `Halo ${customerName}, pesanan ${order.number} sudah kami terima. Penjemputan: ${day}, ${slot}.`
}
