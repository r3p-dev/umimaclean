import vine from '@vinejs/vine'

export const checkCoverageValidator = vine.create({
  lat: vine.number().min(-90).max(90),
  lng: vine.number().min(-180).max(180),
})
