import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { phoneField } from '#validators/shared/rules/phone'

export const loginValidator = vine.create({
  phone: phoneField(),
  password: vine.string().maxLength(128),
  remember: vine.boolean().optional(),
  turnstile: vine.string().optional(),
})
loginValidator.messagesProvider = new SimpleMessagesProvider({
  'password.required': 'Isi kata sandi.',
  'password.maxLength': 'Nomor atau kata sandi salah.',
})
