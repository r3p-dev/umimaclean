export type AdminSection =
  | 'ringkasan'
  | 'pesanan'
  | 'rekonsiliasi'
  | 'layanan'
  | 'pelanggan'
  | 'laporan'
  | 'aktivitas'
  | 'pengaturan'
  | 'profil'

export const ADMIN_NAV: {
  key: Exclude<AdminSection, 'profil'>
  label: string
  route:
    | 'admin.summary'
    | 'admin.orders'
    | 'admin.reconciliation'
    | 'admin.services'
    | 'admin.customers'
    | 'admin.reports'
    | 'admin.activity'
    | 'admin.staff'
}[] = [
  { key: 'ringkasan', label: 'Ringkasan', route: 'admin.summary' },
  { key: 'pesanan', label: 'Pesanan', route: 'admin.orders' },
  { key: 'rekonsiliasi', label: 'Rekonsiliasi', route: 'admin.reconciliation' },
  { key: 'layanan', label: 'Layanan & Harga', route: 'admin.services' },
  { key: 'pelanggan', label: 'Pelanggan', route: 'admin.customers' },
  { key: 'laporan', label: 'Laporan', route: 'admin.reports' },
  { key: 'aktivitas', label: 'Aktivitas Staf', route: 'admin.activity' },
  { key: 'pengaturan', label: 'Pengaturan', route: 'admin.staff' },
]
