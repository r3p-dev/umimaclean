import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const SERVICE_ZONE = 'Asia/Jakarta'
export const PICKUP_DAYS_AHEAD = 7

export const pickupDateRule = vine.createRule((value, _options, field) => {
  if (typeof value !== 'string') {
    return
  }

  const date = DateTime.fromISO(value, { zone: SERVICE_ZONE })
  const today = DateTime.now().setZone(SERVICE_ZONE).startOf('day')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !date.isValid) {
    field.report('Pilih tanggal penjemputan.', 'date.format', field)
  } else if (date <= today || date > today.plus({ days: PICKUP_DAYS_AHEAD })) {
    field.report('Tanggal penjemputan tidak tersedia. Pilih tanggal lain.', 'date.range', field)
  } else if (date.weekday === 7) {
    field.report('Tidak ada penjemputan di hari Minggu.', 'date.sunday', field)
  }
})

export const itemsRule = vine.createRule((value, _options, field) => {
  if (typeof value !== 'object' || value === null) {
    return
  }

  const total = Object.values(value).reduce<number>(
    (sum, count) => sum + (typeof count === 'number' ? count : 0),
    0
  )
  if (total < 1) {
    field.report('Tambahkan minimal 1 barang.', 'items.min', field)
  }
})
