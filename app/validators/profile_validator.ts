import vine from '@vinejs/vine'
import { phoneRule, passwordRule } from '#validators/rules'

export const updateProfileValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(80),
})

export const changePhoneValidator = vine.create({
  phone: phoneRule(),
  currentPassword: vine.string(),
})

export const changePasswordValidator = vine.create({
  currentPassword: vine.string(),
  password: passwordRule(),
  passwordConfirmation: vine.string().sameAs('password'),
})
