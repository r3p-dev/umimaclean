export type AccountSection = 'beranda' | 'pesan' | 'riwayat' | 'profil'

export type ProfileSection = 'profil' | 'alamat' | 'keamanan'

export const ACCOUNT_NAV: {
  key: AccountSection
  label: string
  route:
    'customer.home' | 'customer.order.create' | 'customer.orders.index' | 'customer.profile.show'
}[] = [
  { key: 'beranda', label: 'Beranda', route: 'customer.home' },
  { key: 'pesan', label: 'Pesan', route: 'customer.order.create' },
  { key: 'riwayat', label: 'Riwayat', route: 'customer.orders.index' },
  { key: 'profil', label: 'Profil', route: 'customer.profile.show' },
]

export const PROFILE_NAV: {
  key: ProfileSection
  label: string
  route: 'customer.profile.show' | 'customer.addresses.index' | 'customer.profile.edit'
}[] = [
  { key: 'profil', label: 'Profil', route: 'customer.profile.show' },
  { key: 'alamat', label: 'Alamat', route: 'customer.addresses.index' },
  { key: 'keamanan', label: 'Data diri & kata sandi', route: 'customer.profile.edit' },
]

export function accountSectionOf(url: string): AccountSection {
  const path = url.split('?')[0]
  if (path.startsWith('/pesanan')) {
    return 'riwayat'
  }
  if (path.startsWith('/pesan')) {
    return 'pesan'
  }
  if (path.startsWith('/profil')) {
    return 'profil'
  }
  return 'beranda'
}

export function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
