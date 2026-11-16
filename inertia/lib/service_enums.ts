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

export const ServiceType = {
  MAIN: 'main',
  ADDON: 'addon',
} as const

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType]

export const ServiceTypeLabel: Record<ServiceType, string> = {
  [ServiceType.MAIN]: 'Layanan Utama',
  [ServiceType.ADDON]: 'Layanan Tambahan',
}
