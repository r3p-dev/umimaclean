import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { Role } from '#enums/role_enum'
import { phoneField } from '#validators/shared/rules/phone'

export const saveStaffValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(80),
  phone: phoneField(),
  role: vine.enum([Role.STAFF, Role.ADMIN]),
})

export type StaffPayload = Infer<typeof saveStaffValidator>

export const staffActiveValidator = vine.create({ active: vine.boolean() })
