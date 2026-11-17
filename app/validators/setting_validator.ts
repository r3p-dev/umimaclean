import vine from '@vinejs/vine'
import { phoneRule } from '#validators/rules'

export const storeSettingValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(100),
  whatsapp: phoneRule(),
  address: vine.string().trim().minLength(5).maxLength(255),
})

const clockTime = vine.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)

// A day the shop opens must close after it opens (OWN-8).
const closesAfterOpens = vine.createRule((value, _, field) => {
  const day = value as { isOpen: boolean; opens: string; closes: string }
  if (day.isOpen && day.closes <= day.opens) {
    field.report('Jam tutup harus setelah jam buka.', 'closesAfterOpens', field)
  }
})

export const openingHoursValidator = vine.create({
  days: vine
    .array(
      vine
        .object({
          day: vine.number().in([1, 2, 3, 4, 5, 6, 7]),
          isOpen: vine.boolean(),
          opens: clockTime,
          closes: clockTime,
        })
        .use(closesAfterOpens())
    )
    .fixedLength(7)
    .distinct('day'),
  closure: vine.object({
    isClosed: vine.boolean(),
    until: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
    note: vine.string().trim().maxLength(100).nullable(),
  }),
})

export const pickupSlotItemSchema = vine.object({
  id: vine.string().trim().minLength(1),
  label: vine.string().trim().minLength(1).maxLength(50),
  capacity: vine.number().min(1).max(20),
  isActive: vine.boolean(),
})

export const pickupSlotsSettingValidator = vine.create({
  slots: vine.array(pickupSlotItemSchema).minLength(1),
})

export const pickupSlotsArrayValidator = vine.create(vine.array(pickupSlotItemSchema).minLength(1))
