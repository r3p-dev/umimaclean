import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const cancelOrderValidator = vine.create({
  reason: vine.string().trim().minLength(3).maxLength(200),
})
cancelOrderValidator.messagesProvider = new SimpleMessagesProvider({
  'reason.required': 'Pilih alasan pembatalan.',
  'reason.minLength': 'Pilih alasan pembatalan.',
})
