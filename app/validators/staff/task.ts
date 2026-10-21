import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { SKIP_REASONS } from '#services/order/field_task_service'

export function proofPhoto() {
  return vine.file({ size: '8mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] })
}

export const photoMessages = {
  'photo.required': 'Ambil foto bukti dulu.',
  'photo.file': 'Ambil foto bukti dulu.',
  'photo.file.size': 'Foto terlalu besar (maks. 8 MB).',
  'photo.file.extname': 'Format foto tidak didukung.',
}

export const completeTaskValidator = vine.create({
  photo: proofPhoto(),
  receiver: vine.string().trim().minLength(2).maxLength(80).optional(),
})
completeTaskValidator.messagesProvider = new SimpleMessagesProvider({
  ...photoMessages,
  'receiver.minLength': 'Isi nama penerima barang.',
  'receiver.maxLength': 'Nama penerima maksimal 80 karakter.',
})

export const skipTaskValidator = vine.create({
  reason: vine
    .number()
    .withoutDecimals()
    .in(SKIP_REASONS.map((_, index) => index)),
  note: vine.string().trim().maxLength(200).optional(),
})
skipTaskValidator.messagesProvider = new SimpleMessagesProvider({
  'reason.required': 'Pilih alasan.',
  'reason.in': 'Pilih alasan.',
  'note.maxLength': 'Catatan maksimal 200 karakter.',
})
