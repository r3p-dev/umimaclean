import vine from '@vinejs/vine'

// `q` is the whole address text (MAP-1, D110); the pin ranks the results by distance.
export const searchPlacesValidator = vine.create({
  q: vine.string().trim().minLength(3).maxLength(300),
  lat: vine.number().min(-90).max(90),
  lng: vine.number().min(-180).max(180),
})
