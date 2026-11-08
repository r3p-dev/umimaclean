/*
|--------------------------------------------------------------------------
| Shared validation rules
|--------------------------------------------------------------------------
|
| Reusable VineJS validation rules across schemas.
|
*/

import vine from '@vinejs/vine'

/**
 * Shared email validation rule.
 */
export const emailRule = () => vine.string().email().maxLength(254)

/**
 * Shared password validation rule.
 */
export const passwordRule = () => vine.string().minLength(8).maxLength(32)
