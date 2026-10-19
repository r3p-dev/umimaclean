export const STAFF_PROFILE = {
  name: 'Dedi Supriadi',
  short: 'Dedi S.',
  first: 'Dedi',
  initials: 'DS',
  role: 'Kurir & toko',
  roleLong: 'Staf · kurir & toko · shift pagi',
  shift: 'shift pagi',
  phone: '0812-3456-7801',
  email: 'dedi@umimaclean.id',
  joined: 'Maret 2026',
}

export const STORE_LOCATION = { lat: -6.955631, lng: 107.6539748 }

export function greeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}
