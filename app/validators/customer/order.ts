import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { itemsRule, pickupDateRule } from '#validators/shared/rules/pickup'

export const MAX_ITEMS_PER_KIND = 20
export const PICKUP_SLOT_COUNT = 3

function itemCount() {
  return vine.number().withoutDecimals().range([0, MAX_ITEMS_PER_KIND])
}

function addressId() {
  return vine.number().withoutDecimals().min(1)
}

export const createOrderValidator = vine.create({
  key: vine.string().uuid(),
  items: vine.object({ sepatu: itemCount(), tas: itemCount(), helm: itemCount() }).use(itemsRule()),
  note: vine.string().trim().maxLength(300).optional(),
  date: vine.string().trim().use(pickupDateRule()),
  slot: vine
    .number()
    .withoutDecimals()
    .in(Array.from({ length: PICKUP_SLOT_COUNT }, (_, index) => index)),
  pickupAddressId: addressId(),
  deliveryAddressId: addressId().optional(),
})
createOrderValidator.messagesProvider = new SimpleMessagesProvider({
  'required': 'Lengkapi isian ini.',
  'pickupAddressId.required': 'Pilih alamat penjemputan.',
  'pickupAddressId.number': 'Pilih alamat penjemputan.',
  'note.maxLength': 'Catatan maksimal 300 karakter.',
  'slot.in': 'Pilih jam penjemputan.',
  'key.uuid': 'Muat ulang halaman, lalu coba lagi.',
  'number': 'Isian harus berupa angka.',
  'range': 'Jumlah barang 0 sampai 20 per jenis.',
  'withoutDecimals': 'Isian harus berupa bilangan bulat.',
})

export type OrderPayload = Infer<typeof createOrderValidator>
