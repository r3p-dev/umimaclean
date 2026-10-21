import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const SERVICE_FORM_TYPES = ['utama', 'tambahan'] as const

export const SERVICE_FORM_CATEGORIES = ['Sepatu', 'Tas', 'Helm'] as const

export const saveServiceValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(60),
  type: vine.enum(SERVICE_FORM_TYPES),
  categories: vine.array(vine.enum(SERVICE_FORM_CATEGORIES)).minLength(1).distinct(),
  price: vine.number().withoutDecimals().min(1).max(10_000_000),
  days: vine.number().withoutDecimals().range([0, 30]),
  description: vine.string().trim().maxLength(200).optional(),
  active: vine.boolean(),
})
saveServiceValidator.messagesProvider = new SimpleMessagesProvider({
  'name.required': 'Nama layanan wajib diisi.',
  'name.minLength': 'Nama layanan wajib diisi.',
  'categories.minLength': 'Pilih minimal satu kategori.',
  'price.min': 'Isi harga lebih dari 0.',
  'price.required': 'Isi harga lebih dari 0.',
})

const ids = () => vine.array(vine.number().withoutDecimals().min(1)).minLength(1).maxLength(200)

export const toggleServicesValidator = vine.create({ ids: ids(), active: vine.boolean() })

export const deleteServicesValidator = vine.create({ ids: ids() })
