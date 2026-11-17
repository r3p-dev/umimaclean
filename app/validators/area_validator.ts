import vine from '@vinejs/vine'

export const checkAreaNameValidator = vine.create({
  q: vine.string().trim().minLength(3).maxLength(60),
})
