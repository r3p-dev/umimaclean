import { errors } from '@vinejs/vine'

export function fieldError(field: string, message: string, rule: string) {
  return new errors.E_VALIDATION_ERROR([{ field, message, rule }])
}
