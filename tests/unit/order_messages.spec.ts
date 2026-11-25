import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { orderReceivedText } from '#helpers/order_messages'

test.group('Order messages (MSG-1.1)', () => {
  test('"order received" names the order and the pickup day and slot', ({ assert }) => {
    assert.equal(
      orderReceivedText('Rina Wulandari', {
        number: 'UMC-00042',
        pickupDate: DateTime.fromISO('2026-11-26'),
        pickupStartsAt: '09:00',
        pickupEndsAt: '12:00',
      }),
      'Halo Rina Wulandari, pesanan UMC-00042 sudah kami terima. Penjemputan: Kamis, 26 Nov 2026, 09.00–12.00.'
    )
  })
})
