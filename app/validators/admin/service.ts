import vine from '@vinejs/vine'

const SERVICE_FORM_TYPES = ['utama', 'tambahan'] as const

const SERVICE_FORM_CATEGORIES = ['Sepatu', 'Tas', 'Helm'] as const

export const saveServiceValidator = vine.create({
  serviceName: vine.string().trim().minLength(2).maxLength(60),
  type: vine.enum(SERVICE_FORM_TYPES),
  categories: vine.array(vine.enum(SERVICE_FORM_CATEGORIES)).minLength(1).distinct(),
  price: vine.number().withoutDecimals().min(1).max(10_000_000),
  days: vine.number().withoutDecimals().range([0, 30]),
  description: vine.string().trim().maxLength(200).optional(),
  active: vine.boolean(),
})

const ids = () => vine.array(vine.number().withoutDecimals().min(1)).minLength(1).maxLength(200)

export const toggleServicesValidator = vine.create({ ids: ids(), active: vine.boolean() })

export const deleteServicesValidator = vine.create({ ids: ids() })
