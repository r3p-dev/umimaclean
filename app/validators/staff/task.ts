import vine from '@vinejs/vine'
import { SKIP_REASONS } from '#services/task_service'

export function proofPhoto() {
  return vine.file({ size: '8mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] })
}

export const completeTaskValidator = vine.create({
  photo: proofPhoto(),
  receiver: vine.string().trim().minLength(2).maxLength(80).optional(),
})

export const skipTaskValidator = vine.create({
  reason: vine
    .number()
    .withoutDecimals()
    .in(SKIP_REASONS.map((_, index) => index)),
  note: vine.string().trim().maxLength(200).optional(),
})

export const findRouteValidator = vine.create({
  fromLat: vine.number().range([-90, 90]),
  fromLng: vine.number().range([-180, 180]),
  toLat: vine.number().range([-90, 90]),
  toLng: vine.number().range([-180, 180]),
})

const courierPositionValidator = vine.create({
  lat: vine.number().range([-90, 90]),
  lng: vine.number().range([-180, 180]),
})

export async function courierPosition(header: string | undefined) {
  const [lat, lng] = (header ?? '').split(',')
  const [error, point] = await courierPositionValidator.tryValidate({ lat, lng })
  if (error) {
    return null
  }
  return { lat: Number(point.lat.toFixed(3)), lng: Number(point.lng.toFixed(3)) }
}
