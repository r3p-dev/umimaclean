// Shared display helpers for the online order flow (CUST-5, CUST-6, SVC-5).

export type BagSizeOption = { value: 'S' | 'M' | 'L' | 'XL'; label: string }

export const BAG_SIZE_OPTIONS: readonly BagSizeOption[] = [
  { value: 'S', label: 'Small (< 25 cm)' },
  { value: 'M', label: 'Medium (< 35 cm)' },
  { value: 'L', label: 'Large (< 60 cm)' },
  { value: 'XL', label: 'X-Large (> 60 cm)' },
]

// EU 20 to 50 in half steps (M5a decision 2).
export const SHOE_SIZES: readonly string[] = Array.from({ length: 61 }, (_, index) => {
  const size = 20 + index * 0.5
  return Number.isInteger(size) ? String(size) : size.toFixed(1)
})

const SHORT_DATE = new Intl.DateTimeFormat('id-ID', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Jakarta',
})

const FULL_DATE = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
})

export function formatPickupDate(isoDate: string, style: 'short' | 'full' = 'short') {
  const date = new Date(`${isoDate}T12:00:00+07:00`)
  return (style === 'full' ? FULL_DATE : SHORT_DATE).format(date)
}

export function formatSlotTime(startsAt: string, endsAt: string) {
  return `${startsAt.replace(':', '.')}–${endsAt.replace(':', '.')}`
}

export function bagSizeLabel(value: string) {
  return BAG_SIZE_OPTIONS.find((option) => option.value === value)?.label ?? value
}
