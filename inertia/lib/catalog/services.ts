import { router } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'

export type ServiceType = 'utama' | 'tambahan'

export type ServiceCategory = 'Sepatu' | 'Tas' | 'Helm'

export const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'utama', label: 'Utama' },
  { value: 'tambahan', label: 'Tambahan' },
]

export const SERVICE_CATEGORIES: ServiceCategory[] = ['Sepatu', 'Tas', 'Helm']

export type Service = Data.Service

export type ServiceForm = {
  name: string
  type: ServiceType
  categories: ServiceCategory[]
  price: string
  days: string
  description: string
  active: boolean
}

export const EMPTY_SERVICE_FORM: ServiceForm = {
  name: '',
  type: 'utama',
  categories: ['Sepatu'],
  price: '',
  days: '2',
  description: '',
  active: true,
}

export function serviceFormErrors(form: ServiceForm) {
  const errors: { name?: string; price?: string } = {}
  if (!form.name.trim()) {
    errors.name = 'Nama layanan wajib diisi.'
  } else if (!form.categories.length) {
    errors.name = 'Pilih minimal satu kategori.'
  }
  if (!(Number(form.price) > 0)) {
    errors.price = 'Isi harga lebih dari 0.'
  }
  return errors
}

type Callbacks = { onSuccess?: () => void; onFinish?: () => void }

export function saveService(form: ServiceForm, id: string | null, callbacks: Callbacks = {}) {
  const body = {
    serviceName: form.name.trim(),
    type: form.type,
    categories: form.categories,
    price: Number(form.price),
    days: Number(form.days) || 0,
    description: form.description.trim(),
    active: form.active,
  }
  if (id) {
    router.put(urlFor('admin.services.update', { id }), body, {
      preserveScroll: true,
      ...callbacks,
    })
  } else {
    router.post(urlFor('admin.services.store'), body, { preserveScroll: true, ...callbacks })
  }
}

export function setServicesActive(ids: string[], isActive: boolean, callbacks: Callbacks = {}) {
  router.post(
    urlFor('admin.services.toggle'),
    { ids: ids.map(Number), active: isActive },
    { preserveScroll: true, ...callbacks }
  )
}

export function deleteServices(ids: string[], callbacks: Callbacks = {}) {
  router.post(
    urlFor('admin.services.destroy'),
    { ids: ids.map(Number) },
    { preserveScroll: true, ...callbacks }
  )
}
