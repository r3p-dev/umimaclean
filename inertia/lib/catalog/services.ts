import { createSharedStore } from '~/lib/shared/shared_store'

export type ServiceType = 'utama' | 'tambahan'

export type ServiceCategory = 'Sepatu' | 'Tas' | 'Helm'

export const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'utama', label: 'Utama' },
  { value: 'tambahan', label: 'Tambahan' },
]

export const SERVICE_CATEGORIES: ServiceCategory[] = ['Sepatu', 'Tas', 'Helm']

export type Service = {
  id: string
  label: string
  name: string
  type: ServiceType
  categories: ServiceCategory[]
  price: number
  days: number
  description: string
  active: boolean
}

const SEED: [string, ServiceType, ServiceCategory[], number, number, string][] = [
  ['Deep Clean', 'utama', ['Sepatu'], 45000, 3, 'Cuci menyeluruh bagian luar, dalam, dan sol'],
  ['Fast Clean', 'utama', ['Sepatu'], 30000, 1, 'Bagian luar dan sol, selesai 1 hari'],
  ['Premium Clean', 'utama', ['Tas'], 60000, 4, 'Untuk bahan kanvas, nilon, dan kulit sintetis'],
  ['Helmet Clean', 'utama', ['Helm'], 50000, 2, 'Busa dalam dilepas, dicuci, dan disterilkan'],
  ['Whitening', 'tambahan', ['Sepatu'], 10000, 1, 'Mencerahkan midsole yang kusam'],
  ['Unyellowing sol', 'tambahan', ['Sepatu'], 20000, 2, 'Mengurangi sol kuning'],
  ['Leather care', 'tambahan', ['Sepatu', 'Tas'], 15000, 1, 'Kondisioner untuk bahan kulit'],
  ['Anti-bau', 'tambahan', ['Sepatu', 'Tas', 'Helm'], 8000, 1, 'Deodorizer & antibakteri'],
  ['Waterproof', 'tambahan', ['Sepatu', 'Tas'], 15000, 1, 'Lapisan anti-air'],
]

export const services = createSharedStore<Service[]>('local', 'umima:services', () =>
  SEED.map(([name, type, categories, price, days, description], index) => ({
    id: `s${index + 1}`,
    label: name,
    name,
    type,
    categories,
    price,
    days,
    description,
    active: name !== 'Waterproof',
  }))
)

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
  if (!form.name.trim()) errors.name = 'Nama layanan wajib diisi.'
  else if (!form.categories.length) errors.name = 'Pilih minimal satu kategori.'
  if (!(Number(form.price) > 0)) errors.price = 'Isi harga lebih dari 0.'
  return errors
}

export function saveService(form: ServiceForm, id: string | null) {
  const record = {
    name: form.name.trim(),
    label: form.name.trim(),
    type: form.type,
    categories: form.categories,
    price: Number(form.price),
    days: Number(form.days) || 0,
    description: form.description.trim() || '—',
    active: form.active,
  }
  services.set((list) =>
    id
      ? list.map((service) => (service.id === id ? { ...service, ...record } : service))
      : [...list, { ...record, id: `s${Date.now()}` }]
  )
}

export function setServicesActive(ids: string[], active: boolean) {
  services.set((list) =>
    list.map((service) => (ids.includes(service.id) ? { ...service, active } : service))
  )
}

export function deleteServices(ids: string[]) {
  services.set((list) => list.filter((service) => !ids.includes(service.id)))
}
