import type { NavigationItem } from '~/lib/navigation/links'

export type StaffSection = 'beranda' | 'jemput' | 'proses' | 'antar' | 'lainnya'

export const STAFF_NAVIGATION: NavigationItem<StaffSection>[] = [
  { key: 'beranda', label: 'Beranda', route: 'staff.home' },
]
