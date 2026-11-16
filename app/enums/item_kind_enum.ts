export const ItemKind = {
  SHOE: 'shoe',
  BAG: 'bag',
  HELMET: 'helmet',
} as const

export type ItemKind = (typeof ItemKind)[keyof typeof ItemKind]

export const ItemKindLabel: Record<ItemKind, string> = {
  [ItemKind.SHOE]: 'Sepatu',
  [ItemKind.BAG]: 'Tas',
  [ItemKind.HELMET]: 'Helm',
}
