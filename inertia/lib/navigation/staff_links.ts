import type { NavigationItem } from '~/lib/navigation/links'

export type StaffSection = 'beranda' | 'jemput' | 'proses' | 'antar' | 'lainnya' | 'profil'

export const STAFF_NAVIGATION: NavigationItem<Exclude<StaffSection, 'profil'>>[] = [
  { key: 'beranda', label: 'Beranda', route: 'staff.home' },
]

// Interim (D66): the profile link moves to the "Lainnya" page once it exists (STAFF-16).
export const STAFF_PROFILE_LINK: NavigationItem<'profil'> = {
  key: 'profil',
  label: 'Profil',
  route: 'staff.profile',
}
