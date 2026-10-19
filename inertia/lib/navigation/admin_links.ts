export type AdminSection =
  'ringkasan' | 'pesanan' | 'layanan' | 'pelanggan' | 'laporan' | 'aktivitas' | 'pengaturan'

export const ADMIN_NAV: {
  key: AdminSection
  label: string
  route:
    | 'admin.summary'
    | 'admin.orders'
    | 'admin.services'
    | 'admin.customers'
    | 'admin.reports'
    | 'admin.activity'
    | 'admin.staff'
}[] = [
  { key: 'ringkasan', label: 'Ringkasan', route: 'admin.summary' },
  { key: 'pesanan', label: 'Pesanan', route: 'admin.orders' },
  { key: 'layanan', label: 'Layanan & Harga', route: 'admin.services' },
  { key: 'pelanggan', label: 'Pelanggan', route: 'admin.customers' },
  { key: 'laporan', label: 'Laporan', route: 'admin.reports' },
  { key: 'aktivitas', label: 'Aktivitas Staf', route: 'admin.activity' },
  { key: 'pengaturan', label: 'Pengaturan', route: 'admin.staff' },
]
