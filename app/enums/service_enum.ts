export const ServiceType = {
  MAIN: 'main',
  ADDON: 'addon',
} as const

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType]
