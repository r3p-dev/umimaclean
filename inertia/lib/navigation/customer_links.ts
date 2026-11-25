import type { NavigationItem } from '~/lib/navigation/links'

export type CustomerSection = 'beranda' | 'pesan' | 'riwayat' | 'profil'

export const CUSTOMER_NAVIGATION: NavigationItem<CustomerSection>[] = [
  { key: 'beranda', label: 'Beranda', route: 'customer.home' },
  { key: 'pesan', label: 'Pesan', route: 'customer.orders.create' },
  { key: 'riwayat', label: 'Riwayat', route: 'customer.orders.index' },
  { key: 'profil', label: 'Profil', route: 'customer.profile.show' },
]
