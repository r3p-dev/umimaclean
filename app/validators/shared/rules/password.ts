import vine from '@vinejs/vine'

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 16

export function passwordField() {
  return vine.string().minLength(PASSWORD_MIN_LENGTH).maxLength(PASSWORD_MAX_LENGTH)
}
