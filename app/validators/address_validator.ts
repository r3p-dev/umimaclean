import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { phoneRule } from '#validators/rules'

const addressFields = {
  label: vine.string().trim().minLength(1).maxLength(30),
  recipientName: vine.string().trim().minLength(2).maxLength(80),
  recipientPhone: phoneRule(),
  addressText: vine.string().trim().minLength(10).maxLength(300),
  landmark: vine.string().trim().maxLength(120).optional(),
  lat: vine.number().min(-90).max(90),
  lng: vine.number().min(-180).max(180),
  isPrimary: vine.boolean().optional(),
}

export const createAddressValidator = vine.create(addressFields)
export const updateAddressValidator = vine.create(addressFields)

export const checkPointValidator = vine.create({
  lat: vine.number().min(-90).max(90),
  lng: vine.number().min(-180).max(180),
})

export type AddressInput = Infer<typeof createAddressValidator>
