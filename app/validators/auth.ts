import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { phoneRule, passwordRule } from '#validators/rules'

export const createSessionValidator = vine.create({
  phone: phoneRule(),
  password: passwordRule(),
  rememberMe: vine.boolean().optional(),
})

export type CreateSessionInput = Infer<typeof createSessionValidator>
