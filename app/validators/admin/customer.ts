import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const remindCustomersValidator = vine.create({
  ids: vine.array(vine.number().withoutDecimals().min(1)).minLength(1).maxLength(500),
  message: vine.string().trim().minLength(10).maxLength(500),
})
remindCustomersValidator.messagesProvider = new SimpleMessagesProvider({
  'message.minLength': 'Tulis pesan pengingat terlebih dulu.',
  'message.maxLength': 'Pesan maksimal 500 karakter.',
})
