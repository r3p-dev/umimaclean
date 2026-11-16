import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { phoneRule, passwordRule } from '#validators/rules'

export const forgotPasswordValidator = vine.create({
  phone: phoneRule(),
  turnstile: vine.string().optional(),
})

export const resetPasswordValidator = vine.create({
  password: passwordRule(),
  passwordConfirmation: vine.string().sameAs('password'),
})

export type ForgotPasswordInput = Infer<typeof forgotPasswordValidator>
export type ResetPasswordInput = Infer<typeof resetPasswordValidator>
