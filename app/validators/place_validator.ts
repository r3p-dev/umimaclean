import vine from '@vinejs/vine'

// Without `q` the list holds the places near the pin (MAP-1).
export const searchPlacesValidator = vine.create({
  q: vine.string().trim().minLength(3).maxLength(100).optional(),
  lat: vine.number().min(-90).max(90),
  lng: vine.number().min(-180).max(180),
})
