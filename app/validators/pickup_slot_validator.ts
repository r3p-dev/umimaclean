import vine from '@vinejs/vine'

const clockTime = vine.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)

// A slot ends after it starts (SLOT-2).
const endsAfterStarts = vine.createRule((value, _, field) => {
  const slot = value as { startsAt: string; endsAt: string }
  if (slot.endsAt <= slot.startsAt) {
    field.report('Jam selesai harus setelah jam mulai.', 'endsAfterStarts', field)
  }
})

// Slots of one day may touch (12.00–15.00 after 09.00–12.00) but not overlap (SLOT-2, D106).
const noOverlap = vine.createRule((value, _, field) => {
  const slots = [...(value as { startsAt: string; endsAt: string }[])].sort((first, second) =>
    first.startsAt.localeCompare(second.startsAt)
  )
  const clash = slots.findIndex(
    (slot, index) => index > 0 && slot.startsAt < slots[index - 1].endsAt
  )
  if (clash > 0) {
    const [previous, current] = [slots[clash - 1], slots[clash]]
    field.report(
      `Slot ${current.startsAt.replace(':', '.')}–${current.endsAt.replace(':', '.')} bertabrakan dengan ${previous.startsAt.replace(':', '.')}–${previous.endsAt.replace(':', '.')}.`,
      'noOverlap',
      field
    )
  }
})

// Slots go only on a day the shop opens (D104); the open days come in as metadata.
const openDay = vine.createRule((value, _, field) => {
  const openDays = (field.meta as { openDays: number[] }).openDays
  if (!openDays.includes(value as number)) {
    field.report('Hari ini tutup. Buka dulu di jam operasional.', 'openDay', field)
  }
})

const weekdayParam = vine.object({
  weekday: vine.number().withoutDecimals().range([1, 7]).use(openDay()),
})

export const pickupDaySlotsValidator = vine.create({
  params: weekdayParam,
  slots: vine
    .array(
      vine
        .object({
          id: vine.number().withoutDecimals().positive().optional(),
          startsAt: clockTime,
          endsAt: clockTime,
          capacity: vine.number().withoutDecimals().range([1, 20]),
          isActive: vine.boolean(),
        })
        .use(endsAfterStarts())
    )
    .maxLength(12)
    .use(noOverlap()),
})

export const copyPickupSlotsValidator = vine.create({ params: weekdayParam })
