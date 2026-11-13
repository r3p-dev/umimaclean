import type { NavigationItem } from '~/lib/navigation/links'

export type CustomerSection = 'beranda' | 'pesan' | 'riwayat' | 'profil'

export const CUSTOMER_NAVIGATION: NavigationItem<CustomerSection>[] = [
  { key: 'beranda', label: 'Beranda', route: 'dashboard' },
  { key: 'pesan', label: 'Pesan' },
  { key: 'riwayat', label: 'Riwayat' },
  { key: 'profil', label: 'Profil' },
]
