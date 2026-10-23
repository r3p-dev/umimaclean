import vine from '@vinejs/vine'

export const checkAreaValidator = vine.create({
  lat: vine.number().range([-90, 90]),
  lng: vine.number().range([-180, 180]),
})
