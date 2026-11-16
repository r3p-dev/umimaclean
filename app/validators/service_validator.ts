import vine from '@vinejs/vine'
import { ItemKind } from '#enums/item_kind_enum'
import { ServiceType } from '#enums/service_type_enum'

export const createServiceValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(100),
  type: vine.enum(Object.values(ServiceType)),
  itemKinds: vine.array(vine.enum(Object.values(ItemKind))).minLength(1),
  price: vine.number().min(0).max(10_000_000),
  estimatedDays: vine.number().min(0).max(60),
  isStartingFrom: vine.boolean(),
  description: vine.string().trim().maxLength(500),
  isActive: vine.boolean().optional(),
  displayOrder: vine.number().min(0).optional(),
})

export const updateServiceValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(100),
  type: vine.enum(Object.values(ServiceType)),
  itemKinds: vine.array(vine.enum(Object.values(ItemKind))).minLength(1),
  price: vine.number().min(0).max(10_000_000),
  estimatedDays: vine.number().min(0).max(60),
  isStartingFrom: vine.boolean(),
  description: vine.string().trim().maxLength(500),
  isActive: vine.boolean().optional(),
  displayOrder: vine.number().min(0).optional(),
})

export const toggleServiceValidator = vine.create({
  isActive: vine.boolean(),
})

export const bulkToggleServiceValidator = vine.create({
  ids: vine.array(vine.number().positive()).minLength(1),
  isActive: vine.boolean(),
})
