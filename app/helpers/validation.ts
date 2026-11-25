import { errors as vineErrors } from '@vinejs/vine'

// A business rule shown under a form field, reported as a validation error on that field
// (CONVENTIONS §8).
export function fieldError(field: string, message: string, rule: string): never {
  throw new vineErrors.E_VALIDATION_ERROR([{ field, message, rule }])
}
