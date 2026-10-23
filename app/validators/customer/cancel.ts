import vine from '@vinejs/vine'

export const cancelOrderValidator = vine.create({
  reason: vine.string().trim().minLength(3).maxLength(200),
})
