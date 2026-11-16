import vine from '@vinejs/vine'
import { normalizePhone, isValidIndonesianPhone } from '#helpers/phone'

export const indonesianPhoneValidationRule = vine.createRule((value, _, field) => {
  if (typeof value !== 'string') {
    return
  }
  const normalized = normalizePhone(value)
  if (!isValidIndonesianPhone(normalized)) {
    field.report('Format nomor WhatsApp tidak valid (contoh: 081234567890).', 'phone', field)
    return
  }
  field.mutate(normalized, field)
})

export function phoneRule() {
  return vine.string().use(indonesianPhoneValidationRule())
}

export function passwordRule() {
  return vine.string().minLength(8).maxLength(32)
}
