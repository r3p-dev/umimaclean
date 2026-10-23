import vine from '@vinejs/vine'
import { passwordField } from '#validators/shared/rules/password'

export const changePasswordValidator = vine.create({
  currentPassword: vine.string().maxLength(128),
  password: passwordField().confirmed({ confirmationField: 'passwordConfirmation' }),
})
