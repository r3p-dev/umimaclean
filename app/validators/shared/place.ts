import vine from '@vinejs/vine'

export const searchPlacesValidator = vine.create({
  q: vine.string().trim().maxLength(300).optional(),
  lat: vine.number().range([-90, 90]),
  lng: vine.number().range([-180, 180]),
})
