import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const verifyOtpValidator = vine.create({
  code: vine
    .string()
    .trim()
    .regex(/^\d{6}$/),
})
verifyOtpValidator.messagesProvider = new SimpleMessagesProvider({
  'code.required': 'Isi 6 digit kode dari WhatsApp.',
  'code.regex': 'Isi 6 digit kode dari WhatsApp.',
})
