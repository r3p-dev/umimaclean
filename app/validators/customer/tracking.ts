import vine from '@vinejs/vine'

export const unlockTrackingValidator = vine.create({
  digits: vine
    .string()
    .trim()
    .regex(/^\d{4}$/),
})
