import type { Data } from '@generated/data'

export type ItemKind = Data.Service['itemKinds'][number]
export type ServiceType = Data.Service['type']

export const ItemKind = {
  SHOE: 'shoe',
  BAG: 'bag',
  HELMET: 'helmet',
} as const satisfies Record<string, ItemKind>

export const ItemKindLabel = {
  [ItemKind.SHOE]: 'Sepatu',
  [ItemKind.BAG]: 'Tas',
  [ItemKind.HELMET]: 'Helm',
} satisfies Record<ItemKind, string>

export const ServiceType = {
  MAIN: 'main',
  ADDON: 'addon',
} as const satisfies Record<string, ServiceType>

export const ServiceTypeLabel = {
  [ServiceType.MAIN]: 'Layanan Utama',
  [ServiceType.ADDON]: 'Layanan Tambahan',
} satisfies Record<ServiceType, string>
