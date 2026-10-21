import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { ItemKind } from '#enums/order_enum'
import { photoMessages, proofPhoto } from '#validators/staff/task'

const serviceId = () => vine.number().withoutDecimals().min(1)

export const saveInspectionValidator = vine.create({
  items: vine
    .array(
      vine.object({
        kind: vine.enum(Object.values(ItemKind)),
        name: vine.string().trim().minLength(2).maxLength(80),
        note: vine.string().trim().maxLength(300).optional(),
        services: vine.object({
          main: serviceId(),
          addons: vine.array(serviceId()).maxLength(10),
        }),
      })
    )
    .minLength(1)
    .maxLength(60),
})
saveInspectionValidator.messagesProvider = new SimpleMessagesProvider({
  'items.minLength': 'Tambahkan minimal 1 barang.',
  'items.*.name.minLength': 'Isi nama barang.',
  'items.*.name.maxLength': 'Nama barang maksimal 80 karakter.',
  'items.*.services.main.required': 'Pilih layanan utama untuk setiap barang.',
  'items.*.note.maxLength': 'Catatan maksimal 300 karakter.',
})

export type InspectionPayload = Infer<typeof saveInspectionValidator>

export const washValidator = vine.create({ photo: proofPhoto() })
washValidator.messagesProvider = new SimpleMessagesProvider(photoMessages)
