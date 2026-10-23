import vine from '@vinejs/vine'
import { phoneField } from '#validators/shared/rules/phone'

export const updateProfileValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(80),
})

export const changePhoneValidator = vine.create({
  phone: phoneField(),
  turnstile: vine.string().optional(),
})
