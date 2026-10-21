import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

const TONES = ['jemput', 'periksa', 'bayar', 'cuci', 'antar', 'selesai', 'batal'] as const

export const FIX_METHODS = ['qris_counter', 'cash', 'card', 'qris_online'] as const

const codes = () => vine.array(vine.string().trim().maxLength(12)).minLength(1).maxLength(200)

const reason = () => vine.string().trim().minLength(3).maxLength(200)

export const moveOrdersValidator = vine.create({ codes: codes(), phase: vine.enum(TONES) })

export const cancelOrdersValidator = vine.create({ codes: codes(), reason: reason() })
cancelOrdersValidator.messagesProvider = new SimpleMessagesProvider({
  'reason.required': 'Pilih alasan pembatalan.',
  'reason.minLength': 'Tulis alasan pembatalan.',
})

export const correctPaymentValidator = vine.create({
  method: vine.enum(FIX_METHODS),
  amount: vine.number().withoutDecimals().min(1).max(100_000_000),
  reason: reason(),
})
correctPaymentValidator.messagesProvider = new SimpleMessagesProvider({
  'amount.min': 'Isi jumlah lebih dari 0.',
  'reason.required': 'Tulis alasan koreksi.',
  'reason.minLength': 'Tulis alasan koreksi.',
})

export type CorrectPaymentPayload = Infer<typeof correctPaymentValidator>
