import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { passwordField, passwordMessages } from '#validators/shared/rules/password'

export const changePasswordValidator = vine.create({
  currentPassword: vine.string().maxLength(128),
  password: passwordField().confirmed({ confirmationField: 'passwordConfirmation' }),
})
changePasswordValidator.messagesProvider = new SimpleMessagesProvider({
  ...passwordMessages,
  'currentPassword.required': 'Isi kata sandi saat ini.',
  'currentPassword.maxLength': 'Kata sandi saat ini salah.',
})
