import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { phoneField } from '#validators/shared/rules/phone'

export const STAFF_FORM_ROLES = ['Kurir & toko', 'Workshop', 'Owner'] as const

export const STAFF_FORM_SHIFTS = ['Pagi', 'Siang', 'Fleksibel'] as const

export const saveStaffValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(80),
  phone: phoneField(),
  role: vine.enum(STAFF_FORM_ROLES),
  shift: vine.enum(STAFF_FORM_SHIFTS),
})
saveStaffValidator.messagesProvider = new SimpleMessagesProvider({
  'name.required': 'Nama wajib diisi.',
  'name.minLength': 'Nama wajib diisi.',
})

export type StaffPayload = Infer<typeof saveStaffValidator>

export const staffActiveValidator = vine.create({ active: vine.boolean() })
