export const StaffType = {
  COURIER_STORE: 'courier_store',
  WORKSHOP: 'workshop',
} as const

export const StaffTypeLabel = {
  [StaffType.COURIER_STORE]: 'Kurir & toko',
  [StaffType.WORKSHOP]: 'Workshop',
} as const

export const StaffShift = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  FLEXIBLE: 'flexible',
} as const

export const StaffShiftLabel = {
  [StaffShift.MORNING]: 'Pagi',
  [StaffShift.AFTERNOON]: 'Siang',
  [StaffShift.FLEXIBLE]: 'Fleksibel',
} as const

export type StaffType = (typeof StaffType)[keyof typeof StaffType]
export type StaffShift = (typeof StaffShift)[keyof typeof StaffShift]
