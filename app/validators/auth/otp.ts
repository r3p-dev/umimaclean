import vine from '@vinejs/vine'

export const verifyOtpValidator = vine.create({
  code: vine
    .string()
    .trim()
    .regex(/^\d{6}$/),
})
