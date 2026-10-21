export const ServiceType = {
  MAIN: 'main',
  ADDON: 'addon',
} as const

export const ServiceTypeLabel = {
  [ServiceType.MAIN]: 'Utama',
  [ServiceType.ADDON]: 'Tambahan',
} as const

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType]
