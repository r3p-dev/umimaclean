import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { phoneField } from '#validators/shared/rules/phone'

export const saveAddressValidator = vine.create({
  label: vine.string().trim().minLength(1).maxLength(30),
  recipientName: vine.string().trim().minLength(2).maxLength(80),
  recipientPhone: phoneField(),
  addressText: vine.string().trim().minLength(10).maxLength(300),
  landmark: vine.string().trim().maxLength(120).optional(),
  point: vine.object({
    lat: vine.number().range([-7.35, -6.6]),
    lng: vine.number().range([107.2, 108.0]),
  }),
  isPrimary: vine.boolean().optional(),
})

export type AddressInput = Infer<typeof saveAddressValidator>
