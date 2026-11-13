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
  { key: 'ringkasan', label: 'Ringkasan' },
  { key: 'pesanan', label: 'Pesanan' },
  { key: 'rekonsiliasi', label: 'Rekonsiliasi' },
  { key: 'layanan', label: 'Layanan & Harga' },
  { key: 'pelanggan', label: 'Pelanggan' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'aktivitas', label: 'Aktivitas Staf' },
  { key: 'pengaturan', label: 'Pengaturan' },
]
