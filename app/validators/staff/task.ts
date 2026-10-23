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
