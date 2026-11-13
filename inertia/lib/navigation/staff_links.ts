import type { NavigationItem } from '~/lib/navigation/links'

export type StaffSection = 'beranda' | 'jemput' | 'proses' | 'antar' | 'lainnya'

export const STAFF_NAVIGATION: NavigationItem<StaffSection>[] = [
  { key: 'beranda', label: 'Beranda' },
  { key: 'jemput', label: 'Jemput' },
  { key: 'proses', label: 'Proses' },
  { key: 'antar', label: 'Antar' },
  { key: 'lainnya', label: 'Lainnya' },
]
