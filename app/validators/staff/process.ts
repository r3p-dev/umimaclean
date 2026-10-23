import vine from '@vinejs/vine'
import { ItemKind } from '#enums/order_enum'
import { proofPhoto } from '#validators/staff/task'

const serviceId = () => vine.number().withoutDecimals().min(1)

export const saveInspectionValidator = vine.create({
  items: vine
    .array(
      vine.object({
        kind: vine.enum(Object.values(ItemKind)),
        itemName: vine.string().trim().minLength(2).maxLength(80),
        note: vine.string().trim().maxLength(300).optional(),
        services: vine.object({
          main: serviceId(),
          addons: vine.array(serviceId()).maxLength(10),
        }),
      })
    )
    .minLength(1)
    .maxLength(60),
})

export const washValidator = vine.create({ photo: proofPhoto() })
