import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { emailRule, passwordRule } from '#validators/rules'

export const createUserValidator = vine.create({
  fullName: vine.string().nullable(),
  email: emailRule().unique({ table: 'users', column: 'email' }),
  password: passwordRule().confirmed({ as: 'passwordConfirmation' }),
  passwordConfirmation: vine.string(),
})

export type CreateUserInput = Infer<typeof createUserValidator>

export const createSessionValidator = vine.create({
  email: emailRule(),
  password: passwordRule(),
})

export type CreateSessionInput = Infer<typeof createSessionValidator>
