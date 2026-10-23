import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

const STAGES = ['jemput', 'periksa', 'bayar', 'cuci', 'antar', 'selesai', 'batal'] as const

export const FIX_METHODS = ['qris_counter', 'cash', 'card', 'qris_online'] as const

const codes = () => vine.array(vine.string().trim().maxLength(12)).minLength(1).maxLength(200)

const reason = () => vine.string().trim().minLength(3).maxLength(200)

export const moveOrdersValidator = vine.create({ codes: codes(), stage: vine.enum(STAGES) })

export const cancelOrdersValidator = vine.create({ codes: codes(), reason: reason() })

export const correctPaymentValidator = vine.create({
  method: vine.enum(FIX_METHODS),
  amount: vine.number().withoutDecimals().min(1).max(100_000_000),
  correctionReason: reason(),
})

export type CorrectPaymentPayload = Infer<typeof correctPaymentValidator>
