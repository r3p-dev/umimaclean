import vine from '@vinejs/vine'
import { passwordField } from '#validators/shared/rules/password'
import { phoneField } from '#validators/shared/rules/phone'

export const forgotPasswordValidator = vine.create({
  phone: phoneField(),
  turnstile: vine.string().optional(),
})

export const resetPasswordValidator = vine.create({
  password: passwordField().confirmed({ confirmationField: 'passwordConfirmation' }),
  logoutOthers: vine.boolean().optional(),
})
