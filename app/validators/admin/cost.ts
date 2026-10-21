import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { CostCategoryLabel } from '#enums/cost_enum'

export const saveCostValidator = vine.create({
  category: vine.enum(Object.values(CostCategoryLabel)),
  note: vine.string().trim().minLength(2).maxLength(120),
  amount: vine.number().withoutDecimals().min(1).max(1_000_000_000),
  date: vine.date({ formats: ['YYYY-MM-DD'] }),
})
saveCostValidator.messagesProvider = new SimpleMessagesProvider({
  'amount.min': 'Isi jumlah lebih dari 0.',
  'amount.required': 'Isi jumlah lebih dari 0.',
  'date.required': 'Pilih tanggal biaya.',
  'date.date': 'Pilih tanggal biaya.',
  'note.minLength': 'Isi keterangan biaya.',
})
