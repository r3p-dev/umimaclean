import type { NavigationItem } from '~/lib/navigation/links'

export type OwnerSection =
  | 'ringkasan'
  | 'pesanan'
  | 'rekonsiliasi'
  | 'layanan'
  | 'pelanggan'
  | 'laporan'
  | 'aktivitas'
  | 'pengaturan'
  | 'area'
  | 'profil'

export const OWNER_NAVIGATION: NavigationItem<Exclude<OwnerSection, 'profil'>>[] = [
  { key: 'ringkasan', label: 'Ringkasan', route: 'admin.home' },
  { key: 'layanan', label: 'Layanan & Harga', route: 'admin.services.index' },
  { key: 'pengaturan', label: 'Pengaturan Toko', route: 'admin.settings.store' },
  { key: 'area', label: 'Area Layanan', route: 'admin.areas.index' },
]

export const OWNER_PROFILE_LINK: NavigationItem<'profil'> = {
  key: 'profil',
  label: 'Profil',
  route: 'admin.profile',
}
