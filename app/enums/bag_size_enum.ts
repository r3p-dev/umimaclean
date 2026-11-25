// A declared bag's size (CUST-5); the lengths shown as hints come from the price list (SVC-5).
export const BagSize = {
  SMALL: 'S',
  MEDIUM: 'M',
  LARGE: 'L',
  EXTRA_LARGE: 'XL',
} as const

export type BagSize = (typeof BagSize)[keyof typeof BagSize]

export const BagSizeLabel: Record<BagSize, string> = {
  [BagSize.SMALL]: 'Small',
  [BagSize.MEDIUM]: 'Medium',
  [BagSize.LARGE]: 'Large',
  [BagSize.EXTRA_LARGE]: 'X-Large',
}
