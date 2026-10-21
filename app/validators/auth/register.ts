import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { passwordField, passwordMessages } from '#validators/shared/rules/password'
import { phoneField } from '#validators/shared/rules/phone'

export const registerValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(80),
  phone: phoneField(),
  password: passwordField(),
  terms: vine.accepted(),
  turnstile: vine.string().optional(),
})
registerValidator.messagesProvider = new SimpleMessagesProvider({
  ...passwordMessages,
  'name.required': 'Isi nama Anda.',
  'name.minLength': 'Isi nama Anda.',
  'name.maxLength': 'Nama maksimal 80 karakter.',
  'terms.accepted': 'Setujui syarat & ketentuan untuk mendaftar.',
})
