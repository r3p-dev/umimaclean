import { createSharedStore } from '~/lib/shared/shared_store'

export type StaffRole = 'Kurir & toko' | 'Workshop' | 'Owner'

export type StaffShift = 'Pagi' | 'Siang' | 'Fleksibel'

export const STAFF_ROLES: StaffRole[] = ['Kurir & toko', 'Workshop', 'Owner']

export const STAFF_SHIFTS: StaffShift[] = ['Pagi', 'Siang', 'Fleksibel']

export type StaffAccount = {
  id: string
  name: string
  phone: string
  role: StaffRole
  shift: StaffShift
  active: boolean
  lastSeen: string
}

export const staffAccounts = createSharedStore<StaffAccount[]>(
  'local',
  'umima:staff-accounts',
  () => [
    {
      id: 'u1',
      name: 'Umi Maryam',
      phone: '0811-2200-1100',
      role: 'Owner',
      shift: 'Fleksibel',
      active: true,
      lastSeen: 'Sekarang',
    },
    {
      id: 'u2',
      name: 'Dedi Supriadi',
      phone: '0812-3456-7801',
      role: 'Kurir & toko',
      shift: 'Pagi',
      active: true,
      lastSeen: '8 Okt · 15.10',
    },
    {
      id: 'u3',
      name: 'Sari Wulandari',
      phone: '0813-2233-4455',
      role: 'Workshop',
      shift: 'Pagi',
      active: true,
      lastSeen: '8 Okt · 13.40',
    },
    {
      id: 'u4',
      name: 'Agus Firmansyah',
      phone: '0857-1122-3344',
      role: 'Kurir & toko',
      shift: 'Siang',
      active: true,
      lastSeen: '8 Okt · 12.58',
    },
    {
      id: 'u5',
      name: 'Rizky Ramadhan',
      phone: '0821-9988-7766',
      role: 'Workshop',
      shift: 'Siang',
      active: false,
      lastSeen: '2 Sep',
    },
  ]
)

export function initialsOf(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
}

export type StaffForm = { name: string; phone: string; role: StaffRole; shift: StaffShift }

export const EMPTY_STAFF_FORM: StaffForm = {
  name: '',
  phone: '',
  role: 'Kurir & toko',
  shift: 'Pagi',
}

export function staffFormErrors(form: StaffForm) {
  const errors: { name?: string; phone?: string } = {}
  if (!form.name.trim()) errors.name = 'Nama wajib diisi.'
  if (form.phone.replace(/\D/g, '').length < 10) errors.phone = 'Nomor terlalu pendek.'
  return errors
}

export function saveStaff(form: StaffForm, id: string | null) {
  const record = { name: form.name.trim(), phone: form.phone, role: form.role, shift: form.shift }
  staffAccounts.set((list) =>
    id
      ? list.map((account) => (account.id === id ? { ...account, ...record } : account))
      : [...list, { ...record, id: `u${Date.now()}`, active: true, lastSeen: 'Belum masuk' }]
  )
}

export function setStaffActive(id: string, active: boolean) {
  staffAccounts.set((list) =>
    list.map((account) => (account.id === id ? { ...account, active } : account))
  )
}
