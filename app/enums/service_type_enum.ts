export const ServiceType = {
  MAIN: 'main',
  ADDON: 'addon',
} as const

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType]

export const ServiceTypeLabel: Record<ServiceType, string> = {
  [ServiceType.MAIN]: 'Layanan Utama',
  [ServiceType.ADDON]: 'Layanan Tambahan',
}
