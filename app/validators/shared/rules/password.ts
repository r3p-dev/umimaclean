import vine from '@vinejs/vine'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export function passwordField() {
  return vine.string().minLength(PASSWORD_MIN_LENGTH).maxLength(PASSWORD_MAX_LENGTH)
}
