/*
|--------------------------------------------------------------------------
| Auth Validators
|--------------------------------------------------------------------------
|
| Validation schemas and inferred input types for authentication.
|
*/

import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { emailRule, passwordRule } from '#validators/rules'

/**
 * Validates self-registration data, including password confirmation.
 */
export const registerValidator = vine.create({
  fullName: vine.string().nullable(),
  email: emailRule().unique({ table: 'users', column: 'email' }),
  password: passwordRule().confirmed({ as: 'passwordConfirmation' }),
  passwordConfirmation: vine.string(),
})

/**
 * Input type inferred from the registration validator.
 */
export type RegisterInput = Infer<typeof registerValidator>

/**
 * Validates user credentials for authentication.
 */
export const loginValidator = vine.create({
  email: emailRule(),
  password: passwordRule(),
})

/**
 * Input type inferred from the login validator.
 */
export type LoginInput = Infer<typeof loginValidator>
