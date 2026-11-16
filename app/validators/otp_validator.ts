import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

export const verifyOtpValidator = vine.create({
  code: vine
    .string()
    .trim()
    .regex(/^\d{6}$/),
})

export const resendOtpValidator = vine.create({
  turnstile: vine.string().optional(),
})

export type VerifyOtpInput = Infer<typeof verifyOtpValidator>
export type ResendOtpInput = Infer<typeof resendOtpValidator>
