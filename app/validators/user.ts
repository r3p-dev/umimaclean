/*
|--------------------------------------------------------------------------
| User Validators
|--------------------------------------------------------------------------
|
| Validation schemas and inferred types for user signup and authentication.
|
*/

import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { emailRule, passwordRule } from '#validators/rules'

/**
 * Validator to use when performing self-signup.
 *
 * Uses VineJS .confirmed() to enforce that the confirmation field matches.
 * The confirmation field is also explicitly declared so that it is included
 * in the inferred request body type shared with the frontend.
 */
export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: emailRule().unique({ table: 'users', column: 'email' }),
  password: passwordRule().confirmed({ as: 'passwordConfirmation' }),
  passwordConfirmation: vine.string(),
})

/**
 * Inferred type from self-signup validator.
 */
export type SignupInput = Infer<typeof signupValidator>

/**
 * Validator to use before validating user credentials during login.
 */
export const loginValidator = vine.create({
  email: emailRule(),
  password: passwordRule(),
})

/**
 * Inferred type from login credentials validator.
 */
export type LoginInput = Infer<typeof loginValidator>
