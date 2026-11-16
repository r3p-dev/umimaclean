import vine from '@vinejs/vine'
import { normalizePhone, isValidIndonesianPhone } from '#helpers/phone'

export { normalizePhone, isValidIndonesianPhone, maskPhone, formatPhone } from '#helpers/phone'

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

export const phoneRule = () => vine.string().use(indonesianPhoneValidationRule())

export const passwordRule = () => vine.string().minLength(8).maxLength(32)
