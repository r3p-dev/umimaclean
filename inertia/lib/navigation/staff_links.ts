export type StaffSection = 'beranda' | 'jemput' | 'proses' | 'antar' | 'lainnya'

export const STAFF_NAV: {
  key: StaffSection
  label: string
  route: 'staff.home' | 'staff.pickups' | 'staff.process' | 'staff.deliveries' | 'staff.more'
}[] = [
  { key: 'beranda', label: 'Beranda', route: 'staff.home' },
  { key: 'jemput', label: 'Jemput', route: 'staff.pickups' },
  { key: 'proses', label: 'Proses', route: 'staff.process' },
  { key: 'antar', label: 'Antar', route: 'staff.deliveries' },
  { key: 'lainnya', label: 'Lainnya', route: 'staff.more' },
]
