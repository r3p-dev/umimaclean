import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { addressRule } from '#validators/shared/rules/address'

export const saveAddressValidator = vine.create({
  label: vine.string().trim().minLength(1).maxLength(30),
  recipientName: vine.string().trim().minLength(2).maxLength(80),
  addressText: vine.string().trim().use(addressRule()),
  landmark: vine.string().trim().maxLength(120).optional(),
  point: vine.object({
    lat: vine.number().range([-7.35, -6.6]),
    lng: vine.number().range([107.2, 108.0]),
  }),
  isPrimary: vine.boolean().optional(),
})
saveAddressValidator.messagesProvider = new SimpleMessagesProvider({
  'required': 'Lengkapi isian ini.',
  'recipientName.minLength': 'Isi nama penerima.',
  'recipientName.maxLength': 'Nama penerima maksimal 80 karakter.',
  'label.minLength': 'Pilih atau isi label alamat.',
  'label.maxLength': 'Label maksimal 30 karakter.',
  'landmark.maxLength': 'Patokan maksimal 120 karakter.',
  'point.required': 'Tentukan titik jemput di peta.',
  'point.lat.range': 'Titik jemput di luar area layanan.',
  'point.lng.range': 'Titik jemput di luar area layanan.',
})

export type AddressInput = Infer<typeof saveAddressValidator>
