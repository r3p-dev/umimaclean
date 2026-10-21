import { router } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'

export type StaffRole = 'Kurir & toko' | 'Workshop' | 'Owner'

export type StaffShift = 'Pagi' | 'Siang' | 'Fleksibel'

export const STAFF_ROLES: StaffRole[] = ['Kurir & toko', 'Workshop', 'Owner']

export const STAFF_SHIFTS: StaffShift[] = ['Pagi', 'Siang', 'Fleksibel']

export type StaffAccount = Data.StaffAccount

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
  if (!form.name.trim()) {
    errors.name = 'Nama wajib diisi.'
  }
  if (form.phone.replace(/\D/g, '').length < 10) {
    errors.phone = 'Nomor terlalu pendek.'
  }
  return errors
}

type Callbacks = {
  onSuccess?: () => void
  onFinish?: () => void
  onError?: (errors: Record<string, string>) => void
}

export function saveStaff(form: StaffForm, id: string | null, callbacks: Callbacks = {}) {
  const body = { name: form.name.trim(), phone: form.phone, role: form.role, shift: form.shift }
  if (id) {
    router.put(urlFor('admin.staff.update', { id }), body, { preserveScroll: true, ...callbacks })
  } else {
    router.post(urlFor('admin.staff.store'), body, { preserveScroll: true, ...callbacks })
  }
}

export function setStaffActive(id: string, isActive: boolean, callbacks: Callbacks = {}) {
  router.post(
    urlFor('admin.staff.toggle', { id }),
    { active: isActive },
    { preserveScroll: true, ...callbacks }
  )
}

export function resetStaffPassword(id: string, callbacks: Callbacks = {}) {
  router.post(urlFor('admin.staff.reset', { id }), {}, { preserveScroll: true, ...callbacks })
}
