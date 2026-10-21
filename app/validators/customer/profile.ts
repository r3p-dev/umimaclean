import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { phoneField } from '#validators/shared/rules/phone'

export const updateProfileValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(80),
})
updateProfileValidator.messagesProvider = new SimpleMessagesProvider({
  'name.required': 'Isi nama Anda.',
  'name.minLength': 'Isi nama Anda.',
  'name.maxLength': 'Nama maksimal 80 karakter.',
})

export const changePhoneValidator = vine.create({
  phone: phoneField(),
  turnstile: vine.string().optional(),
})
