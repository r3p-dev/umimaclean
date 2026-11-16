import vine from '@vinejs/vine'
import { phoneRule } from '#validators/rules'

export const storeSettingValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(100),
  whatsapp: phoneRule(),
  address: vine.string().trim().minLength(5).maxLength(255),
  hours: vine.string().trim().minLength(3).maxLength(100),
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
