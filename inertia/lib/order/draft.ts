import { useCallback, useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { urlFor } from '~/client'
import { EMPTY_ITEMS, totalItems, type ItemCounts } from '~/lib/order/items'
import { readStore, writeStore } from '~/lib/shared/storage'

export type PickupPoint = { lat: number; lng: number }

export type PointLabel = { street: string; area: string }

export type OrderDraft = {
  name: string
  phone: string
  address: string
  point: PickupPoint | null
  landmark: string
  items: ItemCounts
  note: string
  date: string | null
  slot: number | null
}

export const ORDER_STEPS = [
  { label: 'Data Diri', route: 'order.details' },
  { label: 'Barang & Jadwal', route: 'order.items' },
  { label: 'Konfirmasi', route: 'order.confirm' },
] as const

const DRAFT_KEY = 'umima:order-draft'

export const EMPTY_DRAFT: OrderDraft = {
  name: '',
  phone: '',
  address: '',
  point: null,
  landmark: '',
  items: EMPTY_ITEMS,
  note: '',
  date: null,
  slot: null,
}

export function firstIncompleteStep(draft: OrderDraft) {
  if (!draft.name || !draft.phone || !draft.address || !draft.point) return 0
  if (totalItems(draft.items) === 0 || !draft.date || draft.slot === null) return 1
  return 2
}

export function clearDraft() {
  writeStore('session', DRAFT_KEY, null)
}

export function useOrderDraft() {
  const [draft, setDraft] = useState<OrderDraft>(() => ({
    ...EMPTY_DRAFT,
    ...readStore<OrderDraft>('session', DRAFT_KEY),
  }))

  useEffect(() => {
    writeStore('session', DRAFT_KEY, draft)
  }, [draft])

  const update = useCallback((patch: Partial<OrderDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
  }, [])

  return [draft, update] as const
}

export function useOrderStep(step: number) {
  const [draft, update] = useOrderDraft()
  const missing = firstIncompleteStep(draft)
  const blocked = missing < step

  useEffect(() => {
    if (blocked) router.visit(urlFor(ORDER_STEPS[missing].route), { replace: true })
  }, [blocked, missing])

  return { draft, update, blocked }
}
