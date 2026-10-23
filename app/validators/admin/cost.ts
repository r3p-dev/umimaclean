import vine from '@vinejs/vine'
import { CostCategoryLabel } from '#enums/cost_enum'

export const saveCostValidator = vine.create({
  category: vine.enum(Object.values(CostCategoryLabel)),
  detail: vine.string().trim().minLength(2).maxLength(120),
  amount: vine.number().withoutDecimals().min(1).max(1_000_000_000),
  date: vine.date({ formats: ['YYYY-MM-DD'] }),
})
