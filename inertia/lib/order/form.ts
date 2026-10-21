import { EMPTY_ITEMS, type ItemCounts } from '~/lib/order/items'
import { firstOpenSlot, type PickupDay } from '~/lib/order/schedule'
import type { SavedAddress } from '~/lib/order/addresses'

export type OrderDraft = {
  key: string
  items: ItemCounts
  note: string
  date: string
  slot: number
  pickupAddressId: number | null
  deliveryAddressId: number | null
}

export type StoredDraft = Omit<OrderDraft, 'pickupAddressId'> & { pickupAddressId: number }

export function initialDraft(
  days: PickupDay[],
  addresses: SavedAddress[],
  stored: StoredDraft | null,
  repeatItems: ItemCounts | null
): OrderDraft {
  const open = days.filter((day) => day.isAvailable)
  const storedDay = stored ? open.find((day) => day.iso === stored.date) : undefined
  const day = storedDay ?? open[0] ?? days[days.length - 1]
  const ids = addresses.map((address) => address.id)
  const fallback = addresses.find((address) => address.isPrimary) ?? addresses[0]
  return {
    key: stored?.key ?? crypto.randomUUID(),
    items: stored?.items ?? repeatItems ?? EMPTY_ITEMS,
    note: stored?.note ?? '',
    date: day.iso,
    slot:
      storedDay && stored && !storedDay.fullSlots.includes(stored.slot)
        ? stored.slot
        : firstOpenSlot(day),
    pickupAddressId:
      stored && ids.includes(stored.pickupAddressId)
        ? stored.pickupAddressId
        : (fallback?.id ?? null),
    deliveryAddressId:
      stored?.deliveryAddressId && ids.includes(stored.deliveryAddressId)
        ? stored.deliveryAddressId
        : null,
  }
}

export function draftPayload(draft: OrderDraft) {
  return {
    key: draft.key,
    items: draft.items,
    note: draft.note.trim(),
    date: draft.date,
    slot: draft.slot,
    pickupAddressId: draft.pickupAddressId,
    ...(draft.deliveryAddressId ? { deliveryAddressId: draft.deliveryAddressId } : {}),
  }
}
