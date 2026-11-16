import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { phoneRule, passwordRule } from '#validators/rules'

export const createRegistrationValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(80),
  phone: phoneRule(),
  password: passwordRule(),
  passwordConfirmation: vine.string().sameAs('password'),
  terms: vine.accepted(),
  turnstile: vine.string().optional(),
})

export type CreateRegistrationInput = Infer<typeof createRegistrationValidator>
