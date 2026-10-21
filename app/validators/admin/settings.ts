import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { SLOT_CAPACITY } from '#services/settings_service'
import { phoneField } from '#validators/shared/rules/phone'

export const saveStoreSettingsValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(60),
  whatsapp: phoneField(),
  address: vine.string().trim().minLength(10).maxLength(200),
  hours: vine.string().trim().minLength(3).maxLength(80),
  areas: vine
    .array(
      vine.object({
        city: vine.string().trim().minLength(3).maxLength(60),
        districts: vine
          .array(vine.string().trim().minLength(3).maxLength(60))
          .maxLength(60)
          .nullable(),
      })
    )
    .minLength(1)
    .maxLength(20),
  slots: vine
    .array(
      vine.object({
        label: vine.string().trim().maxLength(20),
        capacity: vine.number().withoutDecimals().range([SLOT_CAPACITY.min, SLOT_CAPACITY.max]),
        on: vine.boolean(),
      })
    )
    .fixedLength(3),
  payments: vine.object({ qris: vine.boolean(), cash: vine.boolean(), edc: vine.boolean() }),
  inactiveDays: vine.number().withoutDecimals().range([7, 365]),
})
saveStoreSettingsValidator.messagesProvider = new SimpleMessagesProvider({
  'name.minLength': 'Isi nama toko.',
  'address.minLength': 'Lengkapi alamat toko.',
  'hours.minLength': 'Isi jam buka.',
  'areas.minLength': 'Minimal satu kota di area layanan.',
})

export type StoreSettingsPayload = Infer<typeof saveStoreSettingsValidator>
