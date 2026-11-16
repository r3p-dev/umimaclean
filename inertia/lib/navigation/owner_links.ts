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
  | 'profil'

export const OWNER_NAVIGATION: NavigationItem<Exclude<OwnerSection, 'profil'>>[] = [
  { key: 'ringkasan', label: 'Ringkasan', route: 'admin.home' },
]

export const OWNER_PROFILE_LINK: NavigationItem<'profil'> = {
  key: 'profil',
  label: 'Profil',
  route: 'admin.profile',
}
