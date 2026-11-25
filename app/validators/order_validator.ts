import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { BagSize } from '#enums/bag_size_enum'
import { ItemKind } from '#enums/item_kind_enum'

// CUST-5: at most 20 shoes and 20 bags in one order.
export const MAX_ITEMS_PER_KIND = 20
// EU sizes 20 to 50 in half steps: "20", "42", "42.5", "50" (M5a decision 2).
const SHOE_SIZE = /^(?:[2-4]\d(?:\.5)?|50)$/

const atMostPerKind = vine.createRule((value, max: number, field) => {
  if (!Array.isArray(value)) {
    return
  }
  for (const kind of [ItemKind.SHOE, ItemKind.BAG]) {
    if (value.filter((item) => item?.itemKind === kind).length > max) {
      field.report('Maksimal {{ max }} sepatu dan {{ max }} tas per pesanan.', 'perKind', field, {
        max,
      })
      return
    }
  }
})

// One declared item (CUST-5): type and size required, brand optional; helmets are shop-only (SVC-4).
const declaredItem = vine
  .object({
    itemKind: vine.enum([ItemKind.SHOE, ItemKind.BAG]),
    brand: vine.string().trim().maxLength(60).optional(),
    type: vine.string().trim().minLength(1).maxLength(80),
  })
  .merge(
    vine.group([
      vine.group.if((item) => item.itemKind === ItemKind.SHOE, {
        size: vine.string().trim().regex(SHOE_SIZE),
      }),
      vine.group.else({ size: vine.enum(Object.values(BagSize)) }),
    ])
  )

// The order a customer is about to place (CUST-5); placing it re-checks everything that can change
// meanwhile (slot capacity, coverage), in `OrderService.placeOnlineOrder`.
export const createOrderValidator = vine.create({
  items: vine.array(declaredItem).minLength(1).use(atMostPerKind(MAX_ITEMS_PER_KIND)),
  pickupAddressId: vine.number().withoutDecimals(),
  deliveryAddressId: vine.number().withoutDecimals(),
  pickupDate: vine.date({ formats: ['YYYY-MM-DD'] }),
  pickupSlotId: vine.number().withoutDecimals(),
  note: vine.string().trim().maxLength(300).optional(),
})

export const confirmOrderValidator = vine.create({
  requestKey: vine.string().trim().minLength(1).maxLength(64),
})

// CUST-8: customer cancellation reason (3–200 characters).
export const cancelOrderValidator = vine.create({
  reason: vine.string().trim().minLength(3).maxLength(200),
})

export type OrderDraft = Infer<typeof createOrderValidator>
