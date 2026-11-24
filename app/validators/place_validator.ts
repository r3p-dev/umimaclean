import vine from '@vinejs/vine'

// Without `q` the list holds the places near the pin; `q` is the whole address text (MAP-1, D110).
export const searchPlacesValidator = vine.create({
  q: vine.string().trim().minLength(3).maxLength(300).optional(),
  lat: vine.number().min(-90).max(90),
  lng: vine.number().min(-180).max(180),
})
