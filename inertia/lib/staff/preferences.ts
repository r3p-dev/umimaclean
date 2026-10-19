import type { PickupPoint } from '~/lib/order/draft'
import { createSharedStore } from '~/lib/shared/shared_store'

export type MapApp = 'Google Maps' | 'Waze'

export type NotificationKey = 'task' | 'remind' | 'daily'

export const NOTIFICATIONS: { key: NotificationKey; label: string; description: string }[] = [
  {
    key: 'task',
    label: 'Tugas baru dari sistem',
    description: 'Saat ada tugas jemput/antar baru di antrean Anda',
  },
  {
    key: 'remind',
    label: 'Pengingat tugas aktif',
    description: 'Bila tugas aktif belum bergerak 15 menit',
  },
  { key: 'daily', label: 'Ringkasan harian', description: 'Setiap pukul 19.00 via WhatsApp' },
]

export const MAP_APPS: MapApp[] = ['Google Maps', 'Waze']

type Preferences = { notifications: Record<NotificationKey, boolean>; mapApp: MapApp }

export const preferences = createSharedStore<Preferences>(
  'local',
  'umima:staff-preferences',
  () => ({
    notifications: { task: true, remind: true, daily: false },
    mapApp: 'Google Maps',
  })
)

export function navigationLink(point: PickupPoint, app: MapApp) {
  return app === 'Waze'
    ? `https://waze.com/ul?ll=${point.lat},${point.lng}&navigate=yes`
    : `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}&travelmode=driving`
}

export type PasswordForm = { current: string; next: string; confirm: string }

export function passwordErrors(form: PasswordForm) {
  const errors: Partial<Record<keyof PasswordForm, string>> = {}
  if (!form.current) errors.current = 'Isi kata sandi saat ini.'
  if (form.next.length < 8) errors.next = 'Minimal 8 karakter.'
  if (!form.confirm || form.confirm !== form.next) errors.confirm = 'Kata sandi tidak sama.'
  return errors
}
