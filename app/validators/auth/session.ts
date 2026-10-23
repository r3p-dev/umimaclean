import vine from '@vinejs/vine'
import { phoneField } from '#validators/shared/rules/phone'

export const loginValidator = vine.create({
  phone: phoneField(),
  password: vine.string().maxLength(128),
  remember: vine.boolean().optional(),
  turnstile: vine.string().optional(),
})
