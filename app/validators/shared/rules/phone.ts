import vine from '@vinejs/vine'
import { normalizePhone, phoneProblem, type PhoneProblem } from '#services/phone_service'

const MESSAGES: Record<PhoneProblem, string> = {
  required: 'Isi nomor WhatsApp Anda.',
  format: 'Nomor WhatsApp hanya boleh berisi angka.',
  prefix: 'Nomor diawali 8. Contoh: 812 3456 7890',
  minLength: 'Nomor terlalu pendek. Contoh: 812 3456 7890',
  maxLength: 'Nomor terlalu panjang. Contoh: 812 3456 7890',
}

export const phoneRule = vine.createRule((value, _options, field) => {
  if (typeof value !== 'string') {
    return
  }
  const problem = phoneProblem(value)
  if (problem) {
    field.report(MESSAGES[problem], `phone.${problem}`, field)
  }
})

export function phoneField() {
  return vine
    .string()
    .trim()
    .use(phoneRule())
    .transform((value) => normalizePhone(value) ?? value)
}
