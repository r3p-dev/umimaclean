import vine from '@vinejs/vine'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export const passwordMessages = {
  'password.required': 'Isi kata sandi.',
  'password.minLength': `Kata sandi minimal ${PASSWORD_MIN_LENGTH} karakter.`,
  'password.maxLength': `Kata sandi maksimal ${PASSWORD_MAX_LENGTH} karakter.`,
  'password.confirmed': 'Kata sandi tidak sama.',
}

export function passwordField() {
  return vine.string().minLength(PASSWORD_MIN_LENGTH).maxLength(PASSWORD_MAX_LENGTH)
}
